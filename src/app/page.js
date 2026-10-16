import Link from "next/link";
import { Icon, Logo } from "@/components/icons";
import { PhoneMockup } from "@/components/landing/phone-mockup";
import { ReportEmail } from "@/components/landing/report-email";

const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#automation", label: "Automation" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const problems = [
  { icon: "box", title: "Material leakage", text: "Rods, cement and bricks go missing or get over-ordered, with no stock record to check against." },
  { icon: "users", title: "Inflated labour bills", text: "More workers are billed than actually came to the site that day." },
  { icon: "eye", title: "No visibility", text: "Progress arrives as irregular phone calls — no photos, no dates, no numbers." },
  { icon: "wallet", title: "Budget surprises", text: "You find out the money is gone only when the next transfer is requested." },
  { icon: "heart", title: "Strained relationships", text: "Suspicion builds between you and the relative or contractor in charge." },
];

const steps = [
  { time: "Once", icon: "settings", title: "Setup", text: "We onboard your project: total budget, phases, daily spending limit, starting stock and the site manager's phone." },
  { time: "~7 pm", icon: "phone", title: "Manager logs the day", text: "A 2-minute mobile form: materials in and used, workers by type, cash spent and 2–4 photos." },
  { time: "Instantly", icon: "zap", title: "Automatic checks", text: "Stock is recalculated and rules check for anything unusual. Broken rule? SMS and email go out right away." },
  { time: "9 pm", icon: "bell", title: "Missed-day reminder", text: "No log yet? The manager gets an SMS. Still missing next morning, you're told." },
  { time: "10 pm", icon: "mail", title: "Your daily report", text: "A clear English email with the day's summary, photos, budget used and any warnings — written by Claude." },
];

const featureGroups = [
  {
    icon: "phone",
    tag: "Site manager",
    title: "A 2-minute mobile form",
    text: "Large buttons, works on slow mobile data, no app to install.",
    items: ["Magic-link login, no password", "Materials in, materials used, workers by type", "Cash spent with a note", "2–4 photos, compressed on the phone", "Edit today until midnight; past days locked"],
  },
  {
    icon: "chart",
    tag: "Owner",
    title: "Dashboard + daily email",
    text: "Everything you'd see if you stood on site — in English, every evening.",
    items: ["Daily email with summary, photos and warnings", "Budget used vs total", "Current stock for every material", "Labour per week and photo timeline", "Set budget, daily limit and low-stock levels"],
  },
  {
    icon: "shield",
    tag: "Automation",
    title: "Alerts that catch problems",
    text: "Rules run the moment a log arrives — not at the end of the month.",
    items: ["Stock = in − used; alert if used exceeds available", "Alert when daily spend crosses your limit", "Alert when workers jump 50%+ above weekly average", "Missed-log reminder, then a notice to you", "Weekly summary with spending trend"],
  },
];

const workflows = [
  { name: "Log intake", trigger: "Webhook from form", out: "Saves entry, updates stock, runs rules" },
  { name: "Instant alerts", trigger: "Called by Log intake", out: "SMS to manager, email + SMS to owner" },
  { name: "Daily report", trigger: "10 pm Asia/Dhaka", out: "Claude-written HTML email to owner" },
  { name: "Missed-log check", trigger: "9 pm & 9 am", out: "SMS reminder, next-morning owner notice" },
  { name: "Weekly summary", trigger: "Friday 10 pm", out: "Spend, labour & stock trend email" },
];

const plans = [
  {
    name: "Basic",
    price: "£19",
    period: "/ month per house",
    text: "Daily visibility for one site.",
    items: ["Daily report email", "Owner dashboard", "Stock and spend alerts", "1 site manager"],
    cta: "Start with Basic",
  },
  {
    name: "Plus",
    price: "£39",
    period: "/ month per house",
    text: "For families who share the responsibility.",
    items: ["Everything in Basic", "Family supervisor access", "Weekly summary email", "Monthly PDF report", "Priority support"],
    cta: "Choose Plus",
    featured: true,
  },
  {
    name: "Setup",
    price: "£49",
    period: "one-time",
    text: "We do the onboarding for you.",
    items: ["Project, budget and phases set up", "Materials list and starting stock", "Site manager trained in person or by phone"],
    cta: "Book setup",
  },
];

const faqs = [
  {
    q: "Will my site manager feel like I don't trust them?",
    a: "We position SiteWatch as protection for the manager too: a clear, dated record with photos that shows they handled the money honestly. Many managers prefer it to arguing over phone calls.",
  },
  {
    q: "What if the manager enters false numbers?",
    a: "Daily photos are required, stock-in is cross-checked against supplier bills, and sudden changes trigger alerts. You can also request a surprise photo at any time.",
  },
  {
    q: "The site has poor mobile data. Will it work?",
    a: "Yes. The form is lightweight, photos are compressed on the phone before upload, and failed uploads retry automatically.",
  },
  {
    q: "Does my manager need a smartphone app?",
    a: "No. They open a saved link in their phone browser and log in with a magic link — no password, nothing to install.",
  },
  {
    q: "Can a family member in Bangladesh see the reports too?",
    a: "Yes. On the Plus plan a family supervisor gets the same dashboard and the same alerts as you.",
  },
];

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Automation />
      <ReportSection />
      <Pricing />
      <Faq />
      <Cta />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-stone-50/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="SiteWatch BD home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-stone-600 md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-stone-900">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200/60 sm:block"
          >
            Log in
          </Link>
          <a
            href="#pilot"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            Join the pilot
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_20%,rgba(16,185,129,0.14),transparent_70%),radial-gradient(40%_40%_at_10%_80%,rgba(245,158,11,0.10),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(28,25,23,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,25,23,0.04)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Now taking 3 free pilot homes
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
            Watch your dream home being built —{" "}
            <span className="text-emerald-600">from anywhere.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
            Every evening, see exactly what happened on site: materials used, workers present, money spent and photos of the work.
            Instant alerts when something looks wrong.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-700"
            >
              See the live dashboard
              <Icon name="arrowRight" className="size-4" strokeWidth={2.2} />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 font-medium text-stone-800 transition-colors hover:border-stone-400"
            >
              How it works
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-stone-200 pt-6">
            {[
              ["2 min", "for the manager to log a day"],
              ["10 pm", "daily report, Dhaka time"],
              ["Instant", "SMS + email alerts"],
            ].map(([v, l]) => (
              <div key={v}>
                <dt className="text-2xl font-semibold tracking-tight">{v}</dt>
                <dd className="mt-1 text-sm text-stone-500">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="animate-float">
            <PhoneMockup />
          </div>

          <div className="absolute -left-2 top-[38%] hidden w-64 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xl shadow-stone-900/10 sm:block lg:-left-10">
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600">
                <Icon name="alert" className="size-4" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-xs font-semibold">Worker count +73%</p>
                <p className="mt-0.5 text-xs leading-snug text-stone-500">28 reported vs 16 weekly average. SMS sent to you and the manager.</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-2 bottom-12 hidden w-60 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xl shadow-stone-900/10 sm:block lg:-right-6">
            <div className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <Icon name="mail" className="size-4" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-xs font-semibold">Daily report delivered</p>
                <p className="text-xs text-stone-500">10:00 pm Dhaka · 5:00 pm London</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full w-[64%] rounded-full bg-emerald-500" />
            </div>
            <p className="mt-1.5 text-[11px] text-stone-500">64% of budget used · build 58% done</p>
          </div>
        </div>
      </div>

      <div className="border-y border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 text-sm text-stone-500 sm:px-6">
          <span className="font-medium text-stone-700">Built for owners abroad:</span>
          <span>United Kingdom</span>
          <span>United States</span>
          <span>Middle East</span>
          <span className="hidden h-4 w-px bg-stone-200 sm:block" />
          <span>Your home site, back home</span>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, text, center = true }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-lg leading-relaxed text-stone-600">{text}</p>}
    </div>
  );
}

function Problem() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading
        eyebrow="The problem"
        title="Your life savings, built where you can't watch."
        text="Today it's tracked in paper notebooks, scattered messages and memory. You only hear what people choose to tell you."
      />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {problems.map((p) => (
          <div key={p.title} className="rounded-2xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-stone-900/5">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Icon name={p.icon} />
            </span>
            <h3 className="mt-4 font-semibold">{p.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 bg-stone-900 py-24 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">One daily loop.</h2>
          <p className="mt-4 text-lg text-stone-400">The manager logs, the system checks, you read.</p>
        </div>

        <ol className="relative mt-16 grid gap-6 lg:grid-cols-5">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent lg:block" />
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <div className="flex items-center gap-3 lg:flex-col lg:items-start">
                <span className="relative grid size-12 place-items-center rounded-2xl border border-stone-700 bg-stone-800 text-emerald-400">
                  <Icon name={s.icon} />
                </span>
                <span className="rounded-full bg-stone-800 px-2.5 py-0.5 font-mono text-xs text-stone-400">
                  {String(i + 1).padStart(2, "0")} · {s.time}
                </span>
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-24 sm:px-6">
      <SectionHeading eyebrow="Features" title="Built for the owner-abroad, manager-at-site relationship." />
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {featureGroups.map((g) => (
          <div key={g.tag} className="flex flex-col rounded-3xl border border-stone-200 bg-white p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-emerald-600 text-white">
                <Icon name={g.icon} />
              </span>
              <span className="text-sm font-medium text-stone-500">{g.tag}</span>
            </div>
            <h3 className="mt-5 text-xl font-semibold">{g.title}</h3>
            <p className="mt-2 text-sm text-stone-600">{g.text}</p>
            <ul className="mt-6 space-y-3 border-t border-stone-100 pt-6 text-sm">
              {g.items.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Icon name="check" className="mt-0.5 size-4 shrink-0 text-emerald-600" strokeWidth={2.4} />
                  <span className="text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Automation() {
  return (
    <section id="automation" className="scroll-mt-16 border-y border-stone-200 bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Under the hood"
          title="Five automations run the whole product."
          text="The manager's log lands in Supabase, a database webhook wakes n8n, and n8n sends everything you and the manager receive."
        />

        <ArchitectureDiagram />

        <div className="mt-12 overflow-hidden rounded-2xl border border-stone-200">
          <div className="hidden grid-cols-[1fr_1fr_2fr] bg-stone-50 px-5 py-3 text-xs font-medium uppercase tracking-wider text-stone-500 sm:grid">
            <span>Workflow</span>
            <span>Trigger</span>
            <span>Output</span>
          </div>
          {workflows.map((w) => (
            <div key={w.name} className="grid gap-1 border-t border-stone-100 px-5 py-4 text-sm first:border-t-0 sm:grid-cols-[1fr_1fr_2fr] sm:gap-4 sm:first:border-t">
              <span className="flex items-center gap-2 font-medium">
                <Icon name="workflow" className="size-4 text-emerald-600" />
                {w.name}
              </span>
              <span className="font-mono text-xs text-stone-500 sm:self-center">{w.trigger}</span>
              <span className="text-stone-600">{w.out}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Node({ title, sub, highlight }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-center ${
        highlight ? "border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/10" : "border-stone-200 bg-white"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-0.5 text-xs text-stone-500">{sub}</p>
    </div>
  );
}

function Arrow({ label }) {
  return (
    <div className="flex items-center justify-center gap-2 text-stone-400 md:flex-col md:gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      <Icon name="arrowRight" className="size-5 rotate-90 md:rotate-0" />
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="mt-14 rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-6 sm:p-8">
      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
        <Node title="Manager form" sub="Mobile · log + photos" />
        <Arrow label="saves" />
        <Node title="Supabase" sub="Postgres · Storage · RLS" />
        <Arrow label="webhook" />
        <Node title="n8n" sub="5 workflows · checks + alerts" highlight />
        <Arrow label="prompt" />
        <Node title="Claude API" sub="writes the daily summary" />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Node title="Owner dashboard" sub="spend · stock · photos" />
        <Node title="SMS gateway" sub="alerts · reminders" />
        <Node title="Email" sub="daily + weekly reports" />
      </div>
    </div>
  );
}

function ReportSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            center={false}
            eyebrow="The daily report"
            title="Numbers you can trust, in words you can read."
            text="At 10 pm Dhaka time, Claude turns the day's log into a short, honest summary — what happened, what it cost, and what needs your attention."
          />
          <ul className="mt-8 space-y-4">
            {[
              ["camera", "Photos of the day's work, dated and attached"],
              ["wallet", "Spend today and budget used so far"],
              ["alert", "Warnings explained in context — not just red numbers"],
              ["clock", "Arrives at 5 pm in London, 12 pm in New York"],
            ].map(([icon, text]) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-white text-emerald-700 ring-1 ring-stone-200">
                  <Icon name={icon} className="size-4.5" />
                </span>
                <span className="text-stone-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <ReportEmail />
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 border-t border-stone-200 bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pricing"
          title="Less than a phone call home, every month."
          text="Pay per house, for as long as construction runs. Cancel when the keys are handed over."
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-3xl p-7 ${
                p.featured ? "bg-stone-900 text-white shadow-2xl shadow-stone-900/20" : "border border-stone-200 bg-stone-50"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className={`mt-1 text-sm ${p.featured ? "text-stone-400" : "text-stone-500"}`}>{p.text}</p>
              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                <span className={`text-sm ${p.featured ? "text-stone-400" : "text-stone-500"}`}>{p.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Icon
                      name="check"
                      className={`mt-0.5 size-4 shrink-0 ${p.featured ? "text-emerald-400" : "text-emerald-600"}`}
                      strokeWidth={2.4}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#pilot"
                className={`mt-8 rounded-xl py-3 text-center text-sm font-medium transition-colors ${
                  p.featured ? "bg-emerald-500 text-white hover:bg-emerald-400" : "border border-stone-300 bg-white hover:border-stone-400"
                }`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-16 px-4 py-24 sm:px-6">
      <SectionHeading eyebrow="FAQ" title="Questions owners ask us." />
      <div className="mt-12 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
        {faqs.map((f) => (
          <details key={f.q} className="group px-6 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              {f.q}
              <Icon name="plus" className="size-5 shrink-0 text-stone-400 transition-transform group-open:rotate-45" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section id="pilot" className="scroll-mt-16 px-4 pb-24 sm:px-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-emerald-700 px-6 py-16 text-center text-white sm:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(255,255,255,0.18),transparent)]" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-200">Free 6-week pilot</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Building your dream home right now? Be one of our first 3 pilot homes.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-emerald-100">
            Free for 6 weeks. We set everything up and train your site manager. In return, we ask for honest feedback.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:hello@dorio.io?subject=SiteWatch%20BD%20pilot"
              className="rounded-xl bg-white px-6 py-3 font-medium text-emerald-800 transition-colors hover:bg-emerald-50"
            >
              Apply for the pilot
            </a>
            <Link
              href="/dashboard"
              className="rounded-xl border border-emerald-400/60 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Explore the demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:px-6">
        <Logo />
        <p>Built and run by Dorio</p>
        <p>© 2026 SiteWatch BD</p>
      </div>
    </footer>
  );
}
