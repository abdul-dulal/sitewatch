import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Icon, Logo } from "@/components/icons";
import { BudgetChart, LabourChart } from "@/components/dashboard/charts";
import { logout } from "@/app/admin/actions";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import {
  alerts,
  claudeReport,
  formatBDT,
  labourThisWeek,
  photoTimeline,
  project,
  recentLogs,
  spendByWeek,
  stock,
  today,
  workflows,
} from "@/lib/demo-data";

export const metadata = {
  title: "Owner dashboard · SiteWatch BD",
};

const nav = [
  { icon: "home", label: "Overview", href: "#overview", active: true },
  { icon: "layers", label: "Daily logs", href: "#logs" },
  { icon: "box", label: "Stock", href: "#stock" },
  { icon: "image", label: "Photos", href: "#photos" },
  { icon: "bell", label: "Alerts", href: "#alerts", badge: 3 },
  { icon: "workflow", label: "Automations", href: "#automations" },
];

const levelStyles = {
  critical: { label: "Critical", icon: "alert", box: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500" },
  warning: { label: "Warning", icon: "alert", box: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  info: { label: "Info", icon: "info", box: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
};

const logStatus = {
  ok: { label: "On time", className: "bg-emerald-50 text-emerald-700", icon: "checkCircle" },
  late: { label: "After reminder", className: "bg-sky-50 text-sky-700", icon: "clock" },
  flagged: { label: "Flagged", className: "bg-red-50 text-red-700", icon: "alert" },
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AuthedDashboard />
    </Suspense>
  );
}

// Reads the session cookie at request time, so it sits behind the Suspense boundary.
async function AuthedDashboard() {
  const session = verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");
  return <Dashboard email={session.email} />;
}

function DashboardLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-stone-100/70">
      <span className="size-8 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-600" />
    </div>
  );
}

function Dashboard({ email }) {
  const spent = spendByWeek[spendByWeek.length - 1].spent;
  const budgetPct = Math.round((spent / project.totalBudget) * 100);
  const remaining = project.totalBudget - spent;
  const workersToday = today.masons + today.helpers;
  const prior = labourThisWeek.slice(0, -1);
  const avgWorkers = prior.reduce((s, d) => s + d.mason + d.helper, 0) / prior.length;
  const workerJump = Math.round((workersToday / avgWorkers - 1) * 100);
  const overLimitPct = Math.round((today.cashSpent / project.dailyLimit - 1) * 100);

  return (
    <div className="min-h-screen bg-stone-100/70 lg:grid lg:grid-cols-[248px_1fr]">
      <Sidebar email={email} />

      <div className="min-w-0">
        <TopBar />

        <main id="overview" className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Title row */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-stone-500">{today.date} · logged at {today.loggedAt} by {project.manager}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Good evening, {project.owner.split(" ")[0]}</h1>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 hover:border-stone-400">
                <Icon name="camera" className="size-4" />
                Request photo
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-700">
                <Icon name="download" className="size-4" />
                Monthly PDF
              </button>
            </div>
          </div>

          {/* Alert banner */}
          <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-100 text-red-700">
              <Icon name="alert" strokeWidth={2.2} />
            </span>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-red-900">3 alerts from today&apos;s log need your attention</p>
              <p className="text-red-800/80">Worker count, daily spend and stone chip stock. You and {project.manager} were notified at 7:43 pm.</p>
            </div>
            <a href="#alerts" className="rounded-lg bg-white px-3.5 py-2 text-center text-sm font-medium text-red-800 ring-1 ring-red-200 hover:bg-red-100">
              Review alerts
            </a>
          </div>

          {/* KPI tiles */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              label="Budget used"
              value={amount(spent)}
              unit="BDT"
              sub={`of ${formatBDT(project.totalBudget)} · ≈ £${Math.round(spent / project.gbpRate).toLocaleString("en-GB")}`}
            >
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${budgetPct}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-stone-500">
                  <span>{budgetPct}% used</span>
                  <span>{formatBDT(remaining)} left</span>
                </div>
              </div>
            </Kpi>
            <Kpi
              label="Spent today"
              value={amount(today.cashSpent)}
              unit="BDT"
              sub={`Daily limit ${formatBDT(project.dailyLimit)}`}
              status={{ level: "warning", text: `${overLimitPct}% over limit` }}
            />
            <Kpi
              label="Workers today"
              value={workersToday}
              sub={`${today.masons} masons · ${today.helpers} helpers`}
              status={{ level: "critical", text: `+${workerJump}% vs avg` }}
            />
            <Kpi label="Logging rate" value="96%" sub="112 of 117 site days logged" status={{ level: "good", text: "On track" }} />
          </section>

          {/* Budget + alerts */}
          <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Card title="Budget burn" subtitle="Cumulative spend since 1 June, BDT" action={<Pill>{budgetPct}% used · build ~58% done</Pill>}>
              <BudgetChart data={spendByWeek} totalBudget={project.totalBudget} />
            </Card>

            <Card id="alerts" title="Alerts" subtitle="Sent by n8n the moment a rule breaks" action={<Pill>{alerts.length} this week</Pill>}>
              <ul className="space-y-3">
                {alerts.map((a) => {
                  const s = levelStyles[a.level];
                  return (
                    <li key={a.id} className="rounded-xl border border-stone-100 p-3.5">
                      <div className="flex items-start gap-3">
                        <span className={`grid size-8 shrink-0 place-items-center rounded-lg ring-1 ${s.box}`}>
                          <Icon name={s.icon} className="size-4" strokeWidth={2.2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2">
                            <p className="text-sm font-semibold">{a.title}</p>
                          </div>
                          <p className="mt-0.5 text-sm text-stone-600">{a.detail}</p>
                          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-stone-500">
                            <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium ring-1 ${s.box}`}>{s.label}</span>
                            {a.time} · {a.sentTo}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </section>

          {/* Claude report + today's log */}
          <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Card
              title="Tonight's report"
              subtitle="Written by Claude from today's log · emailed at 10:00 pm Dhaka"
              action={
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                  <Icon name="sparkle" className="size-3.5" />
                  AI summary
                </span>
              }
            >
              <div className="space-y-3 text-[15px] leading-relaxed text-stone-700">
                {claudeReport.split("\n\n").map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </Card>

            <Card title="Today's log" subtitle={`Submitted by ${project.manager} at ${today.loggedAt}`}>
              <dl className="space-y-4 text-sm">
                <LogGroup title="Materials received">
                  {today.materialsIn.map((m) => (
                    <LogRow key={m.name} label={m.name} value={m.qty} extra={formatBDT(m.cost)} />
                  ))}
                </LogGroup>
                <LogGroup title="Materials used">
                  {today.materialsUsed.map((m) => (
                    <LogRow key={m.name} label={m.name} value={m.qty} />
                  ))}
                </LogGroup>
                <LogGroup title="Labour">
                  <LogRow label="Masons" value={today.masons} />
                  <LogRow label="Helpers" value={today.helpers} />
                </LogGroup>
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Manager&apos;s note</p>
                  <p className="mt-1 text-stone-700">{today.note}</p>
                </div>
              </dl>
            </Card>
          </section>

          {/* Labour + stock */}
          <section className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
            <Card title="Labour this week" subtitle="Workers present per day, from daily logs">
              <LabourChart data={labourThisWeek} />
            </Card>

            <Card id="stock" title="Current stock" subtitle="Received minus used, per material">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[460px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-stone-500">
                      <th className="pb-3 font-medium">Material</th>
                      <th className="pb-3 text-right font-medium">Received</th>
                      <th className="pb-3 text-right font-medium">Used</th>
                      <th className="pb-3 pl-6 font-medium">In stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {stock.map((m) => {
                      const left = m.inQty - m.used;
                      const isLow = left < m.low;
                      const pct = Math.max(4, (left / m.inQty) * 100);
                      return (
                        <tr key={m.name}>
                          <td className="py-3">
                            <p className="font-medium">{m.name}</p>
                          </td>
                          <td className="py-3 text-right tabular-nums text-stone-600">{fmtQty(m.inQty)}</td>
                          <td className="py-3 text-right tabular-nums text-stone-600">{fmtQty(m.used)}</td>
                          <td className="py-3 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-stone-100">
                                <div className={`h-full rounded-full ${isLow ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="whitespace-nowrap tabular-nums">
                                <b className="font-semibold">{fmtQty(left)}</b> <span className="text-stone-500">{m.unit}</span>
                              </span>
                              {isLow && (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                                  <Icon name="alert" className="size-3" strokeWidth={2.4} />
                                  Low
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Photos */}
          <Card id="photos" title="Photo timeline" subtitle="2–4 photos uploaded with every daily log" action={<Pill>{today.photos} today</Pill>}>
            <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
              {photoTimeline.map((p, i) => (
                <figure key={i} className="w-52 shrink-0 snap-start">
                  <div className={`relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br ${p.tone}`}>
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0_8px,transparent_8px_16px)]" />
                    <Icon name="camera" className="absolute bottom-3 right-3 size-5 text-white/70" />
                    <span className="absolute left-3 top-3 rounded-md bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
                      {p.date}
                    </span>
                  </div>
                  <figcaption className="mt-2 text-sm text-stone-700">{p.caption}</figcaption>
                </figure>
              ))}
            </div>
          </Card>

          {/* Logs + phases + automations */}
          <section className="grid gap-6 xl:grid-cols-3">
            <Card id="logs" title="Recent logs" subtitle="Past days are locked after midnight" className="xl:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-stone-500">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 text-right font-medium">Workers</th>
                      <th className="pb-3 text-right font-medium">Cash spent</th>
                      <th className="pb-3 text-right font-medium">Photos</th>
                      <th className="pb-3 pl-6 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {recentLogs.map((l) => {
                      const s = logStatus[l.status];
                      const overLimit = l.spent > project.dailyLimit;
                      return (
                        <tr key={l.date}>
                          <td className="py-3 font-medium">{l.date}</td>
                          <td className="py-3 text-right tabular-nums">{l.workers}</td>
                          <td className={`py-3 text-right tabular-nums ${overLimit ? "font-semibold text-amber-800" : ""}`}>{formatBDT(l.spent)}</td>
                          <td className="py-3 text-right tabular-nums">{l.photos}</td>
                          <td className="py-3 pl-6">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>
                              <Icon name={s.icon} className="size-3.5" strokeWidth={2.2} />
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Build phases" subtitle="Started 1 Jun 2026 · target handover Jun 2027">
              <ol className="space-y-4">
                {project.phases.map((p) => (
                  <li key={p.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <span
                          className={`size-2 rounded-full ${
                            p.status === "done" ? "bg-emerald-500" : p.status === "active" ? "bg-sky-500 ring-4 ring-sky-100" : "bg-stone-300"
                          }`}
                        />
                        {p.name}
                      </span>
                      <span className="tabular-nums text-stone-500">{p.progress}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className={`h-full rounded-full ${p.status === "done" ? "bg-emerald-500" : "bg-sky-500"}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </section>

          <Card id="automations" title="Automations" subtitle="n8n workflows running for this project">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {workflows.map((w) => (
                <div key={w.name} className="rounded-xl border border-stone-200 p-4">
                  <div className="flex items-center justify-between">
                    <Icon name="workflow" className="size-5 text-emerald-600" />
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                      </span>
                      Active
                    </span>
                  </div>
                  <p className="mt-3 font-semibold">{w.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-stone-500">{w.trigger}</p>
                  <p className="mt-3 border-t border-stone-100 pt-2 text-xs text-stone-500">Last run: {w.lastRun}</p>
                </div>
              ))}
            </div>
          </Card>

          <p className="pb-4 text-center text-xs text-stone-400">Demo data · SiteWatch BD by Dorio</p>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ email }) {
  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-stone-200 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-stone-100 px-5">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <div className="p-4">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
          <p className="text-xs text-stone-500">Project</p>
          <p className="mt-0.5 font-semibold">{project.name}</p>
          <p className="text-xs text-stone-500">{project.location}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              item.active ? "bg-emerald-50 text-emerald-800" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Icon name={item.icon} className="size-4.5" />
            {item.label}
            {item.badge && <span className="ml-auto rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">{item.badge}</span>}
          </a>
        ))}
      </nav>

      <div className="border-t border-stone-100 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-stone-900 text-sm font-semibold uppercase text-white">{email[0]}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{email}</p>
            <p className="truncate text-xs text-stone-500">Admin</p>
          </div>
          <form action={logout}>
            <button type="submit" aria-label="Sign out" title="Sign out" className="grid size-8 place-items-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700">
              <Icon name="logout" className="size-4.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-stone-200 bg-white/85 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="hidden items-center gap-2 text-sm lg:flex">
        <span className="text-stone-500">Projects</span>
        <span className="text-stone-300">/</span>
        <span className="font-medium">{project.name}</span>
        <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Logged today
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-stone-500 sm:block">Plus plan · Supervisor: Rahim (family, on site)</span>
        <a href="#alerts" className="relative grid size-9 place-items-center rounded-lg text-stone-600 hover:bg-stone-100" aria-label="Alerts">
          <Icon name="bell" className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
        </a>
        <form action={logout} className="lg:hidden">
          <button type="submit" aria-label="Sign out" className="grid size-9 place-items-center rounded-lg text-stone-600 hover:bg-stone-100">
            <Icon name="logout" className="size-5" />
          </button>
        </form>
      </div>
    </header>
  );
}

function Card({ id, title, subtitle, action, children, className = "" }) {
  return (
    <section id={id} className={`scroll-mt-20 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Pill({ children }) {
  return <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">{children}</span>;
}

const kpiStatus = {
  good: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
  critical: "bg-red-50 text-red-700",
};

function Kpi({ label, value, unit, sub, status, children }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-stone-500">{label}</p>
        {status && (
          <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${kpiStatus[status.level]}`}>
            <Icon name={status.level === "good" ? "checkCircle" : "alert"} className="size-3.5" strokeWidth={2.2} />
            {status.text}
          </span>
        )}
      </div>
      <p className="mt-2 whitespace-nowrap text-3xl font-semibold tracking-tight tabular-nums">
        {unit && <span className="mr-1.5 text-base font-medium text-stone-500">{unit}</span>}
        {value}
      </p>
      <p className="mt-1 text-sm text-stone-500">{sub}</p>
      {children}
    </div>
  );
}

function LogGroup({ title, children }) {
  return (
    <div>
      <dt className="mb-1.5 text-xs font-medium uppercase tracking-wider text-stone-500">{title}</dt>
      <dd className="divide-y divide-stone-100 rounded-xl border border-stone-100">{children}</dd>
    </div>
  );
}

function LogRow({ label, value, extra }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-stone-600">{label}</span>
      <span className="flex items-center gap-3 tabular-nums">
        {extra && <span className="text-xs text-stone-500">{extra}</span>}
        <span className="font-medium">{value}</span>
      </span>
    </div>
  );
}

function fmtQty(n) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

function amount(n) {
  return Math.round(n).toLocaleString("en-IN");
}
