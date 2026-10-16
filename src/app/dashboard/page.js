import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Icon, Logo } from "@/components/icons";
import { BudgetChart, LabourChart } from "@/components/dashboard/charts";
import { logout } from "@/app/admin/actions";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatUSD } from "@/lib/demo-data";

export const metadata = {
  title: "Owner dashboard · SiteWatch BD",
};

const levelStyles = {
  critical: {
    label: "Critical",
    icon: "alert",
    box: "bg-red-50 text-red-700 ring-red-200",
  },
  warning: {
    label: "Warning",
    icon: "alert",
    box: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  info: {
    label: "Info",
    icon: "info",
    box: "bg-sky-50 text-sky-700 ring-sky-200",
  },
};

const logStatus = {
  ok: {
    label: "On time",
    className: "bg-emerald-50 text-emerald-700",
    icon: "checkCircle",
  },
  late: {
    label: "After reminder",
    className: "bg-sky-50 text-sky-700",
    icon: "clock",
  },
  flagged: {
    label: "Flagged",
    className: "bg-red-50 text-red-700",
    icon: "alert",
  },
};

const photoTones = [
  "from-stone-400 to-stone-600",
  "from-amber-300 to-amber-600",
  "from-slate-400 to-slate-700",
  "from-orange-300 to-orange-700",
  "from-zinc-300 to-zinc-600",
  "from-emerald-300 to-emerald-700",
];

export default function DashboardPage({ searchParams }) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AuthedDashboard searchParams={searchParams} />
    </Suspense>
  );
}

// Reads the session cookie, the ?project= param and Supabase at request time,
// so it sits behind the Suspense boundary.
async function AuthedDashboard({ searchParams }) {
  const session = verifySessionToken(
    (await cookies()).get(SESSION_COOKIE)?.value,
  );
  if (!session) redirect("/admin/login");

  const { project: requested } = await searchParams;

  let data;
  try {
    data = await getDashboardData(
      typeof requested === "string" ? requested : undefined,
    );
  } catch (error) {
    console.error("Dashboard data failed to load", error);
    return (
      <Notice
        email={session.email}
        title="Couldn't load data from Supabase"
        text={error?.message ?? "Unknown error"}
        hint="Check SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local, and that supabase/setup.sql has been run."
      />
    );
  }

  if (!data) {
    return (
      <Notice
        email={session.email}
        title="No project yet"
        text="Supabase is connected, but there is no project in the database."
        hint="Run supabase/setup.sql in the Supabase SQL Editor to create the tables and copy in the sheet data."
      />
    );
  }

  return <Dashboard email={session.email} data={data} />;
}

function DashboardLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-stone-100/70">
      <span className="size-8 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-600" />
    </div>
  );
}

function Notice({ email, title, text, hint }) {
  return (
    <div className="grid min-h-screen place-items-center bg-stone-100/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-8">
        <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200">
          <Icon name="alert" strokeWidth={2.2} />
        </span>
        <h1 className="mt-5 text-xl font-semibold">{title}</h1>
        <p className="mt-2 break-words font-mono text-sm text-stone-600">
          {text}
        </p>
        <p className="mt-4 text-sm text-stone-500">{hint}</p>
        <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4 text-sm text-stone-500">
          <span>Signed in as {email}</span>
          <form action={logout}>
            <button
              type="submit"
              className="font-medium text-stone-700 hover:text-stone-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ email, data }) {
  const { project, today, spent } = data;
  const hasBudget = project.totalBudget > 0;
  const budgetPct = hasBudget
    ? Math.round((spent / project.totalBudget) * 100)
    : null;
  const loggingRate = data.siteDays
    ? Math.round((data.loggedDays / data.siteDays) * 100)
    : 0;

  const labour = data.labourThisWeek;
  const dayTotal = (d) => d.mason + d.helper + d.other;
  const prior = labour.slice(0, -1);
  const avgWorkers = prior.length
    ? prior.reduce((s, d) => s + dayTotal(d), 0) / prior.length
    : 0;
  const workersToday = today ? today.masons + today.helpers + today.others : 0;
  const workerJump = avgWorkers
    ? Math.round((workersToday / avgWorkers - 1) * 100)
    : 0;
  const overLimitPct =
    today && project.dailyLimit
      ? Math.round((today.cashSpent / project.dailyLimit - 1) * 100)
      : 0;
  const progressPill = [
    hasBudget && `${budgetPct}% used`,
    data.buildProgress != null && `build ~${data.buildProgress}% done`,
  ]
    .filter(Boolean)
    .join(" · ");

  const nav = [
    { icon: "home", label: "Overview", href: "#overview", active: true },
    { icon: "layers", label: "Daily logs", href: "#logs" },
    { icon: "box", label: "Stock", href: "#stock" },
    { icon: "image", label: "Photos", href: "#photos" },
    {
      icon: "bell",
      label: "Alerts",
      href: "#alerts",
      badge: data.todayAlerts.count || null,
    },
    { icon: "workflow", label: "Automations", href: "#automations" },
  ];

  return (
    <div className="min-h-screen bg-stone-100/70 lg:grid lg:grid-cols-[248px_1fr]">
      <Sidebar
        email={email}
        project={project}
        projects={data.projects}
        nav={nav}
      />

      <div className="min-w-0">
        <TopBar
          project={project}
          projects={data.projects}
          today={today}
          hasAlerts={data.todayAlerts.count > 0}
        />

        <main
          id="overview"
          className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8"
        >
          {/* Title row */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-stone-500">
                {today
                  ? `${today.date} · logged at ${today.loggedAt} by ${today.sender ?? project.manager}`
                  : "No daily logs yet"}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Good evening, {project.owner.split(" ")[0]}
              </h1>
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
          {data.todayAlerts.count > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-100 text-red-700">
                <Icon name="alert" strokeWidth={2.2} />
              </span>
              <div className="flex-1 text-sm">
                <p className="font-semibold text-red-900">
                  {data.todayAlerts.count}{" "}
                  {data.todayAlerts.count === 1 ? "alert" : "alerts"} from
                  today&apos;s log{" "}
                  {data.todayAlerts.count === 1 ? "needs" : "need"} your
                  attention
                </p>
                <p className="text-red-800/80">
                  {capitalize(joinList(data.todayAlerts.summary))}. You and{" "}
                  {project.manager} were notified.
                </p>
              </div>
              <a
                href="#alerts"
                className="rounded-lg bg-white px-3.5 py-2 text-center text-sm font-medium text-red-800 ring-1 ring-red-200 hover:bg-red-100"
              >
                Review alerts
              </a>
            </div>
          )}

          {/* KPI tiles */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              label={hasBudget ? "Budget used" : "Total spent"}
              value={formatUSD(spent)}
              sub={
                hasBudget
                  ? `of ${formatUSD(project.totalBudget)} total budget`
                  : "Set total_budget in project_settings"
              }
            >
              {hasBudget && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, budgetPct)}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-xs text-stone-500">
                    <span>{budgetPct}% used</span>
                    <span>{formatUSD(project.totalBudget - spent)} left</span>
                  </div>
                </div>
              )}
            </Kpi>
            <Kpi
              label="Spent today"
              value={formatUSD(today?.cashSpent ?? 0)}
              sub={
                project.dailyLimit
                  ? `Daily limit ${formatUSD(project.dailyLimit)}`
                  : "No daily limit set"
              }
              status={
                overLimitPct > 0
                  ? { level: "warning", text: `${overLimitPct}% over limit` }
                  : today &&
                    project.dailyLimit && {
                      level: "good",
                      text: "Within limit",
                    }
              }
            />
            <Kpi
              label="Workers today"
              value={workersToday}
              sub={
                today
                  ? [
                      `${today.masons} masons`,
                      `${today.helpers} helpers`,
                      today.others > 0 && `${today.others} other`,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : "—"
              }
              status={
                workerJump > 50
                  ? { level: "critical", text: `+${workerJump}% vs avg` }
                  : avgWorkers > 0 && {
                      level: "good",
                      text: `${workerJump >= 0 ? "+" : ""}${workerJump}% vs avg`,
                    }
              }
            />
            <Kpi
              label="Logging rate"
              value={`${loggingRate}%`}
              sub={`${data.loggedDays} of ${data.siteDays} site days logged`}
              status={
                loggingRate >= 80
                  ? { level: "good", text: "On track" }
                  : { level: "warning", text: "Below 80%" }
              }
            />
          </section>

          {/* Budget + alerts */}
          <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Card
              title="Budget burn"
              subtitle={`Cumulative spend${project.startDate ? ` since ${project.startDate}` : ""}, USD`}
              action={progressPill && <Pill>{progressPill}</Pill>}
            >
              {data.spendByWeek.length > 1 ? (
                <BudgetChart
                  data={data.spendByWeek}
                  totalBudget={hasBudget ? project.totalBudget : 0}
                />
              ) : (
                <Empty text="The chart appears once logs cover two or more weeks." />
              )}
            </Card>

            <Card
              id="alerts"
              title="Alerts"
              subtitle="Sent by n8n the moment a rule breaks"
              action={<Pill>{data.alerts.length} recent</Pill>}
            >
              {data.alerts.length ? (
                <ul className="space-y-3">
                  {data.alerts.map((a) => {
                    const s = levelStyles[a.level] ?? levelStyles.info;
                    return (
                      <li
                        key={a.id}
                        className="rounded-xl border border-stone-100 p-3.5"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`grid size-8 shrink-0 place-items-center rounded-lg ring-1 ${s.box}`}
                          >
                            <Icon
                              name={s.icon}
                              className="size-4"
                              strokeWidth={2.2}
                            />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{a.title}</p>
                            {a.detail && (
                              <p className="mt-0.5 text-sm text-stone-600">
                                {a.detail}
                              </p>
                            )}
                            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-stone-500">
                              <span
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium ring-1 ${s.box}`}
                              >
                                {s.label}
                              </span>
                              {a.time}
                              {a.sentTo && ` · ${a.sentTo}`}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Empty text="No alerts. Every rule passed." />
              )}
            </Card>
          </section>

          {/* Claude report + today's log */}
          <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Card
              title="Tonight's report"
              subtitle={
                data.report
                  ? `Written by Claude for ${data.report.date} · emailed at 10:00 pm Dhaka`
                  : "Written by Claude · emailed at 10:00 pm Dhaka"
              }
              action={
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                  <Icon name="sparkle" className="size-3.5" />
                  AI summary
                </span>
              }
            >
              {data.report ? (
                <div className="space-y-3 text-[15px] leading-relaxed text-stone-700">
                  {data.report.summary.split(/\n\s*\n/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : (
                <Empty text="No report yet. The first one is sent at 10 pm after a log arrives." />
              )}
            </Card>

            <Card
              title="Today's log"
              subtitle={
                today
                  ? `Submitted by ${today.sender ?? project.manager} at ${today.loggedAt}`
                  : "Waiting for the first log"
              }
            >
              {today ? (
                <dl className="space-y-4 text-sm">
                  {today.materialsIn.length > 0 && (
                    <LogGroup title="Materials received">
                      {today.materialsIn.map((m, i) => (
                        <LogRow
                          key={i}
                          label={m.name}
                          value={m.qty}
                          extra={m.cost != null ? formatUSD(m.cost) : null}
                        />
                      ))}
                    </LogGroup>
                  )}
                  {today.materialsUsed.length > 0 && (
                    <LogGroup title="Materials used">
                      {today.materialsUsed.map((m, i) => (
                        <LogRow key={i} label={m.name} value={m.qty} />
                      ))}
                    </LogGroup>
                  )}
                  <LogGroup title="Labour">
                    <LogRow label="Masons" value={today.masons} />
                    <LogRow label="Helpers" value={today.helpers} />
                    {today.others > 0 && (
                      <LogRow label="Other" value={today.others} />
                    )}
                  </LogGroup>
                  {today.note && (
                    <div className="rounded-xl bg-stone-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                        Manager&apos;s note
                      </p>
                      <p className="mt-1 text-stone-700">{today.note}</p>
                    </div>
                  )}
                </dl>
              ) : (
                <Empty text="Nothing logged yet." />
              )}
            </Card>
          </section>

          {/* Labour + stock */}
          <section className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
            <Card
              title="Labour"
              subtitle="Workers present on the last six logged days"
            >
              {labour.length ? (
                <LabourChart data={labour} />
              ) : (
                <Empty text="No logs yet." />
              )}
            </Card>

            <Card
              id="stock"
              title="Current stock"
              subtitle="Opening stock + received − used, per material"
            >
              {data.stock.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-stone-500">
                        <th className="pb-3 font-medium">Material</th>
                        <th className="pb-3 text-right font-medium">Opening</th>
                        <th className="pb-3 text-right font-medium">
                          Received
                        </th>
                        <th className="pb-3 text-right font-medium">Used</th>
                        <th className="pb-3 pl-6 font-medium">In stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {data.stock.map((m) => {
                        const isLow = m.left < m.low;
                        const total = m.opening + m.inQty;
                        const pct =
                          total > 0 ? Math.max(4, (m.left / total) * 100) : 0;
                        return (
                          <tr key={m.name}>
                            <td className="py-3 font-medium">{m.name}</td>
                            <td className="py-3 text-right tabular-nums text-stone-600">
                              {fmtQty(m.opening)}
                            </td>
                            <td className="py-3 text-right tabular-nums text-stone-600">
                              {fmtQty(m.inQty)}
                            </td>
                            <td className="py-3 text-right tabular-nums text-stone-600">
                              {fmtQty(m.used)}
                            </td>
                            <td className="py-3 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-stone-100">
                                  <div
                                    className={`h-full rounded-full ${isLow ? "bg-amber-500" : "bg-emerald-500"}`}
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                  />
                                </div>
                                <span className="whitespace-nowrap tabular-nums">
                                  <b className="font-semibold">
                                    {fmtQty(m.left)}
                                  </b>{" "}
                                  <span className="text-stone-500">
                                    {m.unit}
                                  </span>
                                </span>
                                {isLow && (
                                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                                    <Icon
                                      name="alert"
                                      className="size-3"
                                      strokeWidth={2.4}
                                    />
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
              ) : (
                <Empty text="No materials set up for this project." />
              )}
            </Card>
          </section>

          {/* Photos */}
          <Card
            id="photos"
            title="Photo timeline"
            subtitle="Photos the manager sends with each daily log"
            action={<Pill>{today?.photos ?? 0} today</Pill>}
          >
            {data.photos.length ? (
              <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
                {data.photos.map((p, i) => (
                  <figure key={p.id} className="w-52 shrink-0 snap-start">
                    <div
                      className={`relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br ${photoTones[i % photoTones.length]}`}
                    >
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0_8px,transparent_8px_16px)]" />
                      <Icon
                        name="camera"
                        className="absolute bottom-3 right-3 size-5 text-white/70"
                      />
                      <span className="absolute left-3 top-3 rounded-md bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
                        {p.date}
                      </span>
                    </div>
                    <figcaption className="mt-2 text-sm text-stone-700">
                      {p.caption ?? "Site photo"}
                      {p.sender && (
                        <span className="block text-xs text-stone-500">
                          by {p.sender}
                        </span>
                      )}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <Empty text="No photos uploaded yet." />
            )}
          </Card>

          {/* Logs + phases */}
          <section className="grid gap-6 xl:grid-cols-3">
            <Card
              id="logs"
              title="Recent logs"
              subtitle="The last six daily logs"
              className="xl:col-span-2"
            >
              {data.recentLogs.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-stone-500">
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">By</th>
                        <th className="pb-3 text-right font-medium">Workers</th>
                        <th className="pb-3 text-right font-medium">
                          Cash spent
                        </th>
                        <th className="pb-3 text-right font-medium">Photos</th>
                        <th className="pb-3 pl-6 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {data.recentLogs.map((l) => {
                        const s = logStatus[l.status] ?? logStatus.ok;
                        const overLimit =
                          project.dailyLimit && l.spent > project.dailyLimit;
                        return (
                          <tr key={l.id}>
                            <td className="py-3 font-medium">{l.date}</td>
                            <td className="py-3 text-stone-600">
                              {l.sender ?? "—"}
                            </td>
                            <td className="py-3 text-right tabular-nums">
                              {l.workers}
                            </td>
                            <td
                              className={`py-3 text-right tabular-nums ${overLimit ? "font-semibold text-amber-800" : ""}`}
                            >
                              {formatUSD(l.spent)}
                            </td>
                            <td className="py-3 text-right tabular-nums">
                              {l.photos}
                            </td>
                            <td className="py-3 pl-6">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}
                              >
                                <Icon
                                  name={s.icon}
                                  className="size-3.5"
                                  strokeWidth={2.2}
                                />
                                {s.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty text="No logs yet." />
              )}
            </Card>

            <Card
              title="Build phases"
              subtitle={[
                project.startDate && `Started ${project.startDate}`,
                project.targetEnd && `target handover ${project.targetEnd}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            >
              {data.phases.length ? (
                <ol className="space-y-4">
                  {data.phases.map((p) => (
                    <li key={p.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium">
                          <span
                            className={`size-2 rounded-full ${
                              p.status === "done"
                                ? "bg-emerald-500"
                                : p.status === "active"
                                  ? "bg-sky-500 ring-4 ring-sky-100"
                                  : "bg-stone-300"
                            }`}
                          />
                          {p.name}
                        </span>
                        <span className="tabular-nums text-stone-500">
                          {p.progress}%
                        </span>
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
              ) : (
                <Empty text="No phases set up. Add rows to the phases table." />
              )}
            </Card>
          </section>

          <Card
            id="automations"
            title="Automations"
            subtitle="n8n workflows behind SiteWatch"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {data.workflows.map((w) => {
                const ok = w.status === "ok";
                return (
                  <div
                    key={w.name}
                    className="rounded-xl border border-stone-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <Icon
                        name="workflow"
                        className="size-5 text-emerald-600"
                      />
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${ok ? "text-emerald-700" : "text-red-700"}`}
                      >
                        <span className="relative flex size-2">
                          {ok && (
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                          )}
                          <span
                            className={`relative inline-flex size-2 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`}
                          />
                        </span>
                        {ok
                          ? "Active"
                          : w.status === "paused"
                            ? "Paused"
                            : "Error"}
                      </span>
                    </div>
                    <p className="mt-3 font-semibold">{w.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-stone-500">
                      {w.trigger}
                    </p>
                    <p className="mt-3 border-t border-stone-100 pt-2 text-xs text-stone-500">
                      Last run: {w.lastRun}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          <p className="pb-4 text-center text-xs text-stone-400">
            Live data from Supabase · amounts converted from{" "}
            {project.currency} to USD · SiteWatch BD by Dorio
          </p>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ email, project, projects, nav }) {
  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-stone-200 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-stone-100 px-5">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <div className="p-4">
        <p className="px-1 pb-2 text-xs font-medium uppercase tracking-wider text-stone-500">
          Projects
        </p>
        <div className="space-y-1">
          {projects.map((p) => {
            const active = p.id === project.id;
            return (
              <Link
                key={p.id}
                href={`/dashboard?project=${encodeURIComponent(p.id)}`}
                className={`block rounded-xl border p-3 transition-colors ${
                  active
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-transparent hover:bg-stone-50"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${active ? "text-stone-900" : "text-stone-700"}`}
                >
                  {p.name}
                </p>
                <p className="text-xs text-stone-500">{p.id}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <nav className="flex-1 space-y-1 border-t border-stone-100 px-3 pt-3">
        {nav.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              item.active
                ? "bg-stone-100 text-stone-900"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Icon name={item.icon} className="size-4.5" />
            {item.label}
            {item.badge && (
              <span className="ml-auto rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      <div className="border-t border-stone-100 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-stone-900 text-sm font-semibold uppercase text-white">
            {email[0]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{email}</p>
            <p className="truncate text-xs text-stone-500">Admin</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="grid size-8 place-items-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <Icon name="logout" className="size-4.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ project, projects, today, hasAlerts }) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/85 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="hidden items-center gap-2 text-sm lg:flex">
          <span className="text-stone-500">Projects</span>
          <span className="text-stone-300">/</span>
          <span className="font-medium">{project.name}</span>
          {today?.isToday ? (
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Logged today
            </span>
          ) : (
            today && (
              <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                <span className="size-1.5 rounded-full bg-stone-400" />
                Last log {today.date}
              </span>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-stone-500 sm:block">
            {project.plan} plan
            {project.offDays && ` · Off: ${project.offDays}`}
          </span>
          <a
            href="#alerts"
            className="relative grid size-9 place-items-center rounded-lg text-stone-600 hover:bg-stone-100"
            aria-label="Alerts"
          >
            <Icon name="bell" className="size-5" />
            {hasAlerts && (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </a>
          <form action={logout} className="lg:hidden">
            <button
              type="submit"
              aria-label="Sign out"
              className="grid size-9 place-items-center rounded-lg text-stone-600 hover:bg-stone-100"
            >
              <Icon name="logout" className="size-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Project switcher for small screens (the sidebar is hidden there) */}
      {projects.length > 1 && (
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard?project=${encodeURIComponent(p.id)}`}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                p.id === project.id
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-100 text-stone-700"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Card({ id, title, subtitle, action, children, className = "" }) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 ${className}`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
      {children}
    </span>
  );
}

function Empty({ text }) {
  return (
    <p className="rounded-xl border border-dashed border-stone-200 px-4 py-8 text-center text-sm text-stone-500">
      {text}
    </p>
  );
}

const kpiStatus = {
  good: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
  critical: "bg-red-50 text-red-700",
};

function Kpi({ label, value, sub, status, children }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-stone-500">{label}</p>
        {status && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${kpiStatus[status.level]}`}
          >
            <Icon
              name={status.level === "good" ? "checkCircle" : "alert"}
              className="size-3.5"
              strokeWidth={2.2}
            />
            {status.text}
          </span>
        )}
      </div>
      <p className="mt-2 whitespace-nowrap text-3xl font-semibold tracking-tight tabular-nums">
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
      <dt className="mb-1.5 text-xs font-medium uppercase tracking-wider text-stone-500">
        {title}
      </dt>
      <dd className="divide-y divide-stone-100 rounded-xl border border-stone-100">
        {children}
      </dd>
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
  return n.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function joinList(items) {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
