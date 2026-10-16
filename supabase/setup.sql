-- SiteWatch BD — database setup
-- Run in Supabase: Dashboard → SQL Editor → New query → paste → Run.
--
-- The first seven tables mirror the Google Sheet the automation uses, tab for tab
-- and column for column (projects, members, materials, logs, material_moves,
-- photos, alerts). Four extra tables hold what the sheet doesn't have:
-- project_settings (budget, dates), phases, daily_reports and workflows.
--
-- Sheet timestamps carry no timezone; they are site-local, so they are stored
-- as Asia/Dhaka (+06). Money stays in the project's currency (BDT), as in the sheet.
--
-- Re-running drops and recreates every SiteWatch table — all data in them is lost.

drop view if exists current_stock;
drop table if exists
  -- tables from the earlier demo schema
  daily_logs,
  -- current schema
  workflows, daily_reports, phases, project_settings,
  alerts, photos, material_moves, logs, materials, members, projects
cascade;

-- ---------------------------------------------------------------------------
-- Sheet tables
-- ---------------------------------------------------------------------------

create table projects (
  project_id    text primary key,
  name          text not null,
  manager_code  text,
  owner_code    text,
  owner_email   text,
  extra_emails  text,
  currency      text not null default 'BDT',
  daily_limit   numeric(14, 2),
  off_days      text                       -- e.g. 'Fri' or 'Fri,Sat'
);

create table members (
  id                bigint generated always as identity primary key,
  project_id        text not null references projects (project_id) on delete cascade,
  role              text not null,         -- owner / manager / supervisor
  name              text,
  telegram_chat_id  text,
  joined_at         timestamptz default now()
);

create table materials (
  project_id       text not null references projects (project_id) on delete cascade,
  name             text not null,
  unit             text,
  opening_stock    numeric(14, 2) not null default 0,
  low_stock_level  numeric(14, 2) not null default 0,
  primary key (project_id, name)
);

create table logs (
  entry_id          text primary key,      -- '<project_id>-<epoch ms>'
  project_id        text not null references projects (project_id) on delete cascade,
  log_date          date not null,
  created_at        timestamptz not null default now(),
  telegram_chat_id  text,
  sender_name       text,
  workers_mason     int not null default 0,
  workers_helper    int not null default 0,
  workers_other     int not null default 0,
  cash_spent        numeric(14, 2) not null default 0,
  note              text,
  raw_text          text
);

create table material_moves (
  id          bigint generated always as identity primary key,
  entry_id    text not null references logs (entry_id) on delete cascade,
  project_id  text not null references projects (project_id) on delete cascade,
  log_date    date not null,
  material    text not null,               -- matches materials.name
  type        text not null check (type in ('in', 'used')),
  quantity    numeric(14, 2) not null,
  cost        numeric(14, 2)
);

create table photos (
  id           bigint generated always as identity primary key,
  project_id   text not null references projects (project_id) on delete cascade,
  log_date     date not null,
  created_at   timestamptz not null default now(),
  file_id      text,                       -- Telegram file_id
  caption      text,
  sender_name  text
);

create table alerts (
  id          bigint generated always as identity primary key,
  project_id  text not null references projects (project_id) on delete cascade,
  log_date    date not null,
  type        text not null,
  key         text unique,                 -- de-duplication key, e.g. 'daily_limit:P001:2026-10-14'
  message     text,
  sent_to     text
);

create index on logs (project_id, log_date desc);
create index on material_moves (entry_id);
create index on material_moves (project_id, material);
create index on photos (project_id, log_date desc);
create index on alerts (project_id, log_date desc);

-- Current stock per material: opening stock + received - used.
create view current_stock with (security_invoker = true) as
select
  m.project_id,
  m.name,
  m.unit,
  m.opening_stock,
  m.low_stock_level,
  coalesce(sum(mm.quantity) filter (where mm.type = 'in'), 0)   as received,
  coalesce(sum(mm.quantity) filter (where mm.type = 'used'), 0) as used,
  m.opening_stock
    + coalesce(sum(mm.quantity) filter (where mm.type = 'in'), 0)
    - coalesce(sum(mm.quantity) filter (where mm.type = 'used'), 0) as in_stock
from materials m
left join material_moves mm
  on mm.project_id = m.project_id and lower(mm.material) = lower(m.name)
group by m.project_id, m.name, m.unit, m.opening_stock, m.low_stock_level;

-- ---------------------------------------------------------------------------
-- Extra tables (not in the sheet)
-- ---------------------------------------------------------------------------

create table project_settings (
  project_id    text primary key references projects (project_id) on delete cascade,
  total_budget  numeric(14, 2),            -- same currency as projects.currency
  start_date    date,
  target_end    date,
  location      text,
  plan          text not null default 'basic' check (plan in ('basic', 'plus'))
);

create table phases (
  id          bigint generated always as identity primary key,
  project_id  text not null references projects (project_id) on delete cascade,
  name        text not null,
  position    int not null,
  status      text not null default 'upcoming' check (status in ('done', 'active', 'upcoming')),
  progress    int not null default 0 check (progress between 0 and 100)
);

-- The Claude-written report the "Daily report" workflow emails each night.
create table daily_reports (
  id          bigint generated always as identity primary key,
  project_id  text not null references projects (project_id) on delete cascade,
  log_date    date not null,
  summary     text not null,
  sent_at     timestamptz,
  unique (project_id, log_date)
);

-- Last run of each n8n workflow; n8n updates its own row at the end of a run.
create table workflows (
  name         text primary key,
  trigger      text not null,
  position     int not null default 0,
  status       text not null default 'ok' check (status in ('ok', 'error', 'paused')),
  last_run_at  timestamptz
);

-- Row-level security on everywhere. No policies yet, so only the server
-- (secret key) can read or write.
alter table projects         enable row level security;
alter table members          enable row level security;
alter table materials        enable row level security;
alter table logs             enable row level security;
alter table material_moves   enable row level security;
alter table photos           enable row level security;
alter table alerts           enable row level security;
alter table project_settings enable row level security;
alter table phases           enable row level security;
alter table daily_reports    enable row level security;
alter table workflows        enable row level security;

-- ---------------------------------------------------------------------------
-- Data copied from the Google Sheet
-- ---------------------------------------------------------------------------

insert into projects (project_id, name, manager_code, owner_code, owner_email, extra_emails, currency, daily_limit, off_days) values
  ('P001', 'Dhanmondi Residence', 'SW-M-1234', 'SW-O-1234', 'owner1@example.com', null, 'BDT', 50000, 'Fri'),
  ('P002', 'Uttara Duplex',       'SW-M-5678', 'SW-O-5678', 'owner2@example.com', null, 'BDT', 30000, 'Fri');

insert into members (project_id, role, name, telegram_chat_id, joined_at) values
  ('P001', 'manager', 'Rahim Mia',         '100000001',  '2026-10-01 09:00:00+06'),
  ('P001', 'owner',   'Karim Ahmed',       '100000002',  '2026-10-01 09:05:00+06'),
  ('P002', 'manager', 'Jamal Uddin',       '100000003',  '2026-10-02 10:00:00+06'),
  ('P001', 'manager', 'Abdul Dulal Islam', '8914813803', '2026-10-15 21:08:46+06');

insert into materials (project_id, name, unit, opening_stock, low_stock_level) values
  ('P001', 'Cement', 'bag', 200,   50),
  ('P001', 'Rod',    'kg',  2000,  500),
  ('P001', 'Sand',   'cft', 1000,  200),
  ('P001', 'Brick',  'pcs', 10000, 2000),
  ('P002', 'Cement', 'bag', 100,   30),
  ('P002', 'Brick',  'pcs', 5000,  1000);

insert into logs (entry_id, project_id, log_date, created_at, telegram_chat_id, sender_name, workers_mason, workers_helper, workers_other, cash_spent, note, raw_text) values
  ('P001-1760400000000', 'P001', '2026-10-13', '2026-10-13 18:30:00+06', '100000001', 'Rahim Mia',   4, 6, 0, 18500, 'Slab casting prep',
   'সিমেন্ট এলো ৫০ ব্যাগ, মিস্ত্রি ৪ জন, হেল্পার ৬ জন, খরচ ১৮৫০০ টাকা'),
  ('P001-1760486400000', 'P001', '2026-10-14', '2026-10-14 18:10:00+06', '100000001', 'Rahim Mia',   5, 7, 1, 22000, 'Column work',
   'রড লাগলো ১৫০ কেজি, সিমেন্ট লাগলো ২০ ব্যাগ, মিস্ত্রি ৫, হেল্পার ৭, অন্যান্য ১, খরচ ২২০০০'),
  ('P002-1760486500000', 'P002', '2026-10-14', '2026-10-14 17:45:00+06', '100000003', 'Jamal Uddin', 3, 4, 0, 12000, 'Brick work',
   'ইট লাগলো ১৫০০ পিস, মিস্ত্রি ৩, হেল্পার ৪, খরচ ১২০০০');

insert into material_moves (entry_id, project_id, log_date, material, type, quantity, cost) values
  ('P001-1760400000000', 'P001', '2026-10-13', 'Cement', 'in',   50,   27500),
  ('P001-1760486400000', 'P001', '2026-10-14', 'Rod',    'used', 150,  null),
  ('P001-1760486400000', 'P001', '2026-10-14', 'Cement', 'used', 20,   null),
  ('P002-1760486500000', 'P002', '2026-10-14', 'Brick',  'used', 1500, null);

insert into photos (project_id, log_date, created_at, file_id, caption, sender_name) values
  ('P001', '2026-10-10', '2026-10-10 17:00:00+06', 'DEMO_FILE_ID', 'Demo photo row (safe to delete)', 'Rahim Mia');

insert into alerts (project_id, log_date, type, key, message, sent_to) values
  ('P001', '2026-10-10', 'demo', 'demo:1', 'Demo alert row (safe to delete)', 'email');

-- ---------------------------------------------------------------------------
-- Starter data for the extra tables (edit freely in the Table Editor)
-- ---------------------------------------------------------------------------

insert into project_settings (project_id, total_budget, start_date, target_end, location, plan) values
  ('P001', 8500000, '2026-10-01', '2027-09-30', null, 'plus'),
  ('P002', 5000000, '2026-10-02', '2027-06-30', null, 'basic');

insert into phases (project_id, name, position, status, progress) values
  ('P001', 'Foundation',         1, 'done',     100),
  ('P001', 'Ground floor frame', 2, 'active',   40),
  ('P001', 'First floor slab',   3, 'upcoming', 0),
  ('P001', 'Brickwork',          4, 'upcoming', 0),
  ('P001', 'Finishing',          5, 'upcoming', 0),
  ('P002', 'Foundation',         1, 'done',     100),
  ('P002', 'Brickwork',          2, 'active',   30),
  ('P002', 'Roof slab',          3, 'upcoming', 0),
  ('P002', 'Finishing',          4, 'upcoming', 0);

insert into daily_reports (project_id, log_date, summary, sent_at) values
  ('P001', '2026-10-14',
'Column work continued today. The crew used 150 kg of rod and 20 bags of cement, with 5 masons, 7 helpers and 1 other worker on site.

Spending was $183, comfortably within your $417 daily limit. Cement stands at 230 bags after yesterday''s delivery of 50, and rod at 1,850 kg — both well above their low-stock levels.

No alerts were raised today.',
   '2026-10-14 22:00:00+06'),
  ('P002', '2026-10-14',
'Brickwork continued with 3 masons and 4 helpers on site. 1,500 bricks were used, leaving 3,500 in stock — still above the 1,000 low-stock level, but worth planning the next order.

Spending was $100, within your $250 daily limit. No alerts were raised today.',
   '2026-10-14 22:00:00+06');

insert into workflows (name, trigger, position, status, last_run_at) values
  ('Log intake',       'Telegram message from manager', 1, 'ok', '2026-10-14 18:10:00+06'),
  ('Instant alerts',   'Called by Log intake',          2, 'ok', null),
  ('Daily report',     '10:00 pm Asia/Dhaka',           3, 'ok', '2026-10-14 22:00:00+06'),
  ('Missed-log check', '9:00 pm & 9:00 am',             4, 'ok', '2026-10-16 09:00:00+06'),
  ('Weekly summary',   'Friday 10:00 pm',               5, 'ok', '2026-10-09 22:00:00+06');
