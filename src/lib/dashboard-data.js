import { supabaseAdmin } from "@/lib/supabase";

// Loads everything the owner dashboard shows from Supabase and shapes it for the UI.
// Tables mirror the automation's Google Sheet (projects, members, materials, logs,
// material_moves, photos, alerts) plus project_settings, phases, daily_reports, workflows.
//
// Money is stored in the project's currency (BDT) and converted to USD for display.
// Times are shown in the site's timezone (Asia/Dhaka).

const TZ = "Asia/Dhaka";
const LATE_AFTER_HOUR = 21; // logs after the 9 pm reminder count as late

// Units of each currency per 1 USD. Override BDT with BDT_PER_USD in .env.local.
const PER_USD = { USD: 1, BDT: Number(process.env.BDT_PER_USD) || 120 };

export async function getDashboardData(requestedProjectId) {
  const db = supabaseAdmin();

  const projects = await q(db.from("projects").select("project_id, name").order("project_id"));
  if (!projects.length) return null;

  const projectId = projects.some((p) => p.project_id === requestedProjectId) ? requestedProjectId : projects[0].project_id;

  const [[project], [settings], members, logs, stock, moves, photos, alerts, phases, [report], workflows] = await Promise.all([
    q(db.from("projects").select("*").eq("project_id", projectId)),
    q(db.from("project_settings").select("*").eq("project_id", projectId)),
    q(db.from("members").select("role, name, joined_at").eq("project_id", projectId).order("joined_at")),
    q(db.from("logs").select("*").eq("project_id", projectId).order("log_date").order("created_at")),
    q(db.from("current_stock").select("*").eq("project_id", projectId).order("name")),
    q(db.from("material_moves").select("entry_id, material, type, quantity, cost").eq("project_id", projectId)),
    q(db.from("photos").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(8)),
    q(db.from("alerts").select("*").eq("project_id", projectId).order("log_date", { ascending: false }).order("id", { ascending: false })),
    q(db.from("phases").select("*").eq("project_id", projectId).order("position")),
    q(db.from("daily_reports").select("*").eq("project_id", projectId).order("log_date", { ascending: false }).limit(1)),
    q(db.from("workflows").select("*").order("position")),
  ]);

  return shape({ projects, project, settings, members, logs, stock, moves, photos, alerts, phases, report, workflows });
}

async function q(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

function shape({ projects, project, settings, members, logs, stock, moves, photos, alerts, phases, report, workflows }) {
  const rate = PER_USD[project.currency?.toUpperCase()] ?? 1;
  const usd = (amount) => (amount == null ? null : Number(amount) / rate);

  // A project can have more than one person per role; the latest one to join wins.
  const person = (role) => members.filter((m) => m.role === role).at(-1);
  const offDays = parseOffDays(project.off_days);
  const units = Object.fromEntries(stock.map((m) => [m.name.toLowerCase(), m.unit]));

  const latest = logs.at(-1) ?? null;
  const startDate = settings?.start_date ?? logs[0]?.log_date ?? null;
  const alertDays = new Set(alerts.filter((a) => a.type !== "demo").map((a) => a.log_date));
  const workers = (l) => l.workers_mason + l.workers_helper + l.workers_other;

  const logStatus = (l) => {
    if (alertDays.has(l.log_date)) return "flagged";
    const submitted = dhakaParts(l.created_at);
    return submitted.date > l.log_date || submitted.hour >= LATE_AFTER_HOUR ? "late" : "ok";
  };

  // Budget burn: cumulative spend, one point per project week.
  let cumulative = 0;
  const weekly = new Map();
  for (const log of logs) {
    cumulative += usd(log.cash_spent);
    const week = Math.floor(daysBetween(startDate, log.log_date) / 7) + 1;
    weekly.set(week, { week: `W${week}`, label: shortDate(log.log_date), spent: cumulative });
  }

  const latestMoves = latest ? moves.filter((m) => m.entry_id === latest.entry_id) : [];
  const moveRow = (m) => ({
    name: m.material,
    qty: `${fmtQty(m.quantity)} ${units[m.material.toLowerCase()] ?? ""}`.trim(),
    cost: usd(m.cost),
  });

  const photoCount = (day) => photos.filter((p) => p.log_date === day).length;
  const todayAlerts = latest ? alerts.filter((a) => a.log_date === latest.log_date && a.type !== "demo") : [];

  return {
    projects: projects.map((p) => ({ id: p.project_id, name: p.name })),
    project: {
      id: project.project_id,
      name: project.name,
      location: settings?.location ?? null,
      plan: settings?.plan === "plus" ? "Plus" : "Basic",
      currency: project.currency,
      totalBudget: usd(settings?.total_budget),
      dailyLimit: usd(project.daily_limit),
      startDate: startDate ? longDate(startDate, { weekday: undefined }) : null,
      targetEnd: settings?.target_end ? monthYear(settings.target_end) : null,
      owner: person("owner")?.name ?? "Owner",
      manager: person("manager")?.name ?? "the site manager",
      supervisor: person("supervisor") ?? null,
      offDays: offDays.map((d) => DAY_NAMES[d]).join(", "),
    },
    spent: cumulative,
    spendByWeek: [...weekly.values()],
    labourThisWeek: logs.slice(-6).map((l) => ({
      day: weekday(l.log_date),
      date: shortDate(l.log_date),
      mason: l.workers_mason,
      helper: l.workers_helper,
      other: l.workers_other,
    })),
    loggedDays: new Set(logs.map((l) => l.log_date)).size,
    siteDays: latest ? countSiteDays(startDate, latest.log_date, offDays) : 0,
    today: latest && {
      date: longDate(latest.log_date),
      loggedAt: time(latest.created_at),
      sender: latest.sender_name,
      isToday: latest.log_date === dhakaParts(new Date()).date,
      cashSpent: usd(latest.cash_spent),
      masons: latest.workers_mason,
      helpers: latest.workers_helper,
      others: latest.workers_other,
      photos: photoCount(latest.log_date),
      note: latest.note,
      materialsIn: latestMoves.filter((m) => m.type === "in").map(moveRow),
      materialsUsed: latestMoves.filter((m) => m.type === "used").map(moveRow),
    },
    todayAlerts: {
      count: todayAlerts.length,
      summary: [...new Set(todayAlerts.map((a) => alertLabel(a.type).toLowerCase()))],
    },
    alerts: alerts.slice(0, 6).map((a) => ({
      id: a.id,
      level: alertLevel(a.type),
      title: alertLabel(a.type),
      detail: a.message,
      time: relativeDay(a.log_date, latest?.log_date),
      sentTo: a.sent_to,
    })),
    stock: stock.map((m) => ({
      name: m.name,
      unit: m.unit,
      opening: Number(m.opening_stock),
      inQty: Number(m.received),
      used: Number(m.used),
      left: Number(m.in_stock),
      low: Number(m.low_stock_level),
    })),
    recentLogs: logs
      .slice(-6)
      .reverse()
      .map((l) => ({
        id: l.entry_id,
        date: shortDate(l.log_date),
        sender: l.sender_name,
        workers: workers(l),
        spent: usd(l.cash_spent),
        photos: photoCount(l.log_date),
        status: logStatus(l),
      })),
    photos: photos.map((p) => ({
      id: p.id,
      date: shortDate(p.log_date),
      caption: p.caption,
      sender: p.sender_name,
    })),
    phases: phases.map((p) => ({ name: p.name, status: p.status, progress: p.progress })),
    buildProgress: phases.length ? Math.round(phases.reduce((s, p) => s + p.progress, 0) / phases.length) : null,
    report: report ? { summary: report.summary, date: shortDate(report.log_date) } : null,
    workflows: workflows.map((w) => ({
      name: w.name,
      trigger: w.trigger,
      status: w.status,
      lastRun: w.last_run_at ? relativeTime(w.last_run_at, latest?.log_date) : "Not yet",
    })),
  };
}

/* ---------- alerts ---------- */

const ALERTS = {
  workers_jump: { label: "Worker count jump", level: "critical" },
  daily_limit: { label: "Daily spend over limit", level: "warning" },
  low_stock: { label: "Low stock", level: "warning" },
  stock_negative: { label: "Used more than in stock", level: "critical" },
  missed_log: { label: "Missed log", level: "info" },
  demo: { label: "Demo alert", level: "info" },
};

function alertLabel(type) {
  return ALERTS[type]?.label ?? capitalize(String(type).replaceAll("_", " "));
}

function alertLevel(type) {
  return ALERTS[type]?.level ?? "warning";
}

/* ---------- dates ---------- */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "Fri" / "Fri,Sat" / "friday" → [5] / [5, 6]
function parseOffDays(value) {
  return String(value ?? "")
    .split(/[,;/\s]+/)
    .map((d) => DAY_NAMES.findIndex((n) => d.toLowerCase().startsWith(n.toLowerCase())))
    .filter((i) => i >= 0);
}

// "YYYY-MM-DD" → Date at UTC noon, so formatting in UTC never shifts the day.
const asDate = (d) => new Date(`${d}T12:00:00Z`);

function fmt(date, options, timeZone = "UTC") {
  return new Intl.DateTimeFormat("en-GB", { timeZone, ...options }).format(date);
}

const shortDate = (d) => fmt(asDate(d), { day: "numeric", month: "short" });
const weekday = (d) => fmt(asDate(d), { weekday: "short" });
const monthYear = (d) => fmt(asDate(d), { month: "short", year: "numeric" });

function longDate(d, extra = {}) {
  return fmt(asDate(d), { weekday: "short", day: "numeric", month: "short", year: "numeric", ...extra });
}

function time(ts) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" })
    .format(new Date(ts))
    .toLowerCase();
}

function dhakaParts(ts) {
  const date = new Date(ts);
  return {
    date: new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date),
    hour: Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" }).format(date)),
  };
}

// "Today" / "Yesterday" relative to the latest log day; otherwise "Mon, 12 Oct".
function relativeDay(day, referenceDay) {
  if (day === referenceDay) return "Today";
  if (referenceDay && daysBetween(day, referenceDay) === 1) return "Yesterday";
  return fmt(asDate(day), { weekday: "short", day: "numeric", month: "short" });
}

function relativeTime(ts, referenceDay) {
  const label = relativeDay(dhakaParts(ts).date, referenceDay);
  return label === "Today" || label === "Yesterday" ? `${label}, ${time(ts)}` : label;
}

function daysBetween(from, to) {
  return Math.round((asDate(to) - asDate(from)) / 86_400_000);
}

function countSiteDays(from, to, offDays) {
  let count = 0;
  for (let i = 0; i <= daysBetween(from, to); i++) {
    const day = new Date(asDate(from).getTime() + i * 86_400_000);
    if (!offDays.includes(day.getUTCDay())) count++;
  }
  return count;
}

function fmtQty(n) {
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
