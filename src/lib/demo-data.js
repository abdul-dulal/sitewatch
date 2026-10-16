// Demo project used by the landing page previews and the owner dashboard.
// Shapes mirror the Supabase tables in the project brief (projects, materials,
// daily_logs, material_moves, photos, alerts).

export const project = {
  name: "Rahman Residence",
  location: "Family home project",
  owner: "Kamal Rahman",
  ownerCity: "London, UK",
  manager: "Jalal Uddin",
  currency: "BDT",
  totalBudget: 8500000,
  dailyLimit: 60000,
  startDate: "2026-06-01",
  today: "2026-10-15",
  gbpRate: 152, // BDT per GBP, for the owner's reference figure
  phases: [
    { name: "Foundation", status: "done", progress: 100 },
    { name: "Ground floor frame", status: "done", progress: 100 },
    { name: "First floor slab", status: "active", progress: 68 },
    { name: "Brickwork", status: "upcoming", progress: 12 },
    { name: "Finishing", status: "upcoming", progress: 0 },
  ],
};

// Cumulative spend per week (BDT), weeks counted from project start.
export const spendByWeek = [
  { week: "W1", label: "1 Jun", spent: 410000 },
  { week: "W3", label: "15 Jun", spent: 980000 },
  { week: "W5", label: "29 Jun", spent: 1460000 },
  { week: "W7", label: "13 Jul", spent: 1920000 },
  { week: "W9", label: "27 Jul", spent: 2510000 },
  { week: "W11", label: "10 Aug", spent: 3040000 },
  { week: "W13", label: "24 Aug", spent: 3620000 },
  { week: "W15", label: "7 Sep", spent: 4180000 },
  { week: "W17", label: "21 Sep", spent: 4710000 },
  { week: "W19", label: "5 Oct", spent: 5230000 },
  { week: "W20", label: "15 Oct", spent: 5482000 },
];

// Workers present per day this week (from daily_logs).
export const labourThisWeek = [
  { day: "Sat", date: "10 Oct", mason: 6, helper: 9 },
  { day: "Sun", date: "11 Oct", mason: 6, helper: 10 },
  { day: "Mon", date: "12 Oct", mason: 7, helper: 10 },
  { day: "Tue", date: "13 Oct", mason: 6, helper: 9 },
  { day: "Wed", date: "14 Oct", mason: 7, helper: 11 },
  { day: "Thu", date: "15 Oct", mason: 11, helper: 17 },
];

// Current stock = sum(in) - sum(used) per material (database view).
export const stock = [
  { name: "Cement", unit: "bags", inQty: 1450, used: 1288, low: 120 },
  { name: "Rod (60 grade)", unit: "tonnes", inQty: 19.5, used: 16.9, low: 2 },
  { name: "Bricks", unit: "pcs", inQty: 62000, used: 41500, low: 8000 },
  { name: "Sand", unit: "cft", inQty: 5200, used: 4400, low: 600 },
  { name: "Stone chips", unit: "cft", inQty: 2400, used: 2210, low: 300 },
];

export const today = {
  date: "Thu, 15 Oct 2026",
  cashSpent: 71500,
  masons: 11,
  helpers: 17,
  photos: 4,
  loggedAt: "7:42 pm",
  materialsIn: [{ name: "Cement", qty: "50 bags", cost: 27500 }],
  materialsUsed: [
    { name: "Cement", qty: "38 bags" },
    { name: "Rod", qty: "0.4 t" },
    { name: "Stone chips", qty: "180 cft" },
  ],
  note: "First floor slab casting, east side. Mixer machine rented for the day.",
};

export const alerts = [
  {
    id: 1,
    level: "critical",
    title: "Worker count jumped 73% above weekly average",
    detail: "28 workers reported today vs. 16.2 average earlier this week.",
    time: "Today, 7:43 pm",
    sentTo: "Owner (email + SMS), Manager (SMS)",
  },
  {
    id: 2,
    level: "warning",
    title: "Daily spend crossed the limit",
    detail: "BDT 71,500 spent vs. BDT 60,000 daily limit (+19%).",
    time: "Today, 7:43 pm",
    sentTo: "Owner (email + SMS), Manager (SMS)",
  },
  {
    id: 3,
    level: "warning",
    title: "Stone chips are running low",
    detail: "190 cft left, below the 300 cft low-stock level.",
    time: "Today, 7:43 pm",
    sentTo: "Owner (email)",
  },
  {
    id: 4,
    level: "info",
    title: "Log arrived after reminder",
    detail: "Reminder SMS sent at 9:00 pm, log received 9:18 pm.",
    time: "Mon, 12 Oct",
    sentTo: "Manager (SMS)",
  },
];

export const recentLogs = [
  { date: "15 Oct", workers: 28, spent: 71500, photos: 4, status: "flagged" },
  { date: "14 Oct", workers: 18, spent: 52300, photos: 3, status: "ok" },
  { date: "13 Oct", workers: 15, spent: 38900, photos: 3, status: "ok" },
  { date: "12 Oct", workers: 17, spent: 44100, photos: 2, status: "late" },
  { date: "11 Oct", workers: 16, spent: 41800, photos: 4, status: "ok" },
  { date: "10 Oct", workers: 15, spent: 36200, photos: 3, status: "ok" },
];

export const photoTimeline = [
  { date: "15 Oct", caption: "Slab casting, east side", tone: "from-stone-400 to-stone-600" },
  { date: "15 Oct", caption: "Mixer machine on site", tone: "from-amber-300 to-amber-600" },
  { date: "14 Oct", caption: "Rod binding complete", tone: "from-slate-400 to-slate-700" },
  { date: "13 Oct", caption: "Shuttering, first floor", tone: "from-orange-300 to-orange-700" },
  { date: "12 Oct", caption: "Cement delivery, 50 bags", tone: "from-zinc-300 to-zinc-600" },
  { date: "11 Oct", caption: "Column check, north wall", tone: "from-emerald-300 to-emerald-700" },
];

export const claudeReport = `Today was a heavy day on site: the crew cast the east half of the first-floor slab. That explains most of what you see in the numbers — 50 bags of cement arrived, 38 were used, and a mixer was rented for the day.

Two things need your attention. Spending reached BDT 71,500, about 19% above your BDT 60,000 daily limit, and 28 workers were reported, well above this week's average of 16. Slab days usually need extra hands, so this may be fine, but it is worth confirming the count with Jalal. Stone chips are also low (190 cft left), so another order will be needed before the west half is cast.

Overall you have used 64% of the budget with the build at roughly 58% complete.`;

export const workflows = [
  { name: "Log intake", trigger: "Webhook from manager form", lastRun: "7:42 pm", status: "ok" },
  { name: "Instant alerts", trigger: "Called by Log intake", lastRun: "7:43 pm", status: "ok" },
  { name: "Daily report", trigger: "10:00 pm Asia/Dhaka", lastRun: "Yesterday 10:00 pm", status: "ok" },
  { name: "Missed-log check", trigger: "9:00 pm & 9:00 am", lastRun: "9:00 am", status: "ok" },
  { name: "Weekly summary", trigger: "Friday 10:00 pm", lastRun: "Fri, 9 Oct", status: "ok" },
];

export function formatBDT(value) {
  return "BDT " + Math.round(value).toLocaleString("en-IN");
}

export function formatLakh(value) {
  return "BDT " + (value / 100000).toFixed(1) + "L";
}
