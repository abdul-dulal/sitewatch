import Link from "next/link";
import { Icon, Logo } from "@/components/icons";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Admin login · SiteWatch BD",
};

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-stone-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_10%,rgba(16,185,129,0.25),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />

        <Link href="/" className="relative">
          <Logo dark />
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Every site day, logged, checked and reported.
          </h2>
          <ul className="mt-8 space-y-4 text-stone-300">
            {[
              ["chart", "Budget, stock and labour at a glance"],
              ["bell", "Instant alerts when a rule breaks"],
              ["sparkle", "Daily summary written by Claude"],
            ].map(([icon, text]) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-white/10 text-emerald-400">
                  <Icon name={icon} className="size-4.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-stone-500">© 2026 SiteWatch BD · Built by Dorio</p>
      </aside>

      <main className="flex items-center justify-center bg-stone-50 px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 inline-block lg:hidden">
            <Logo />
          </Link>

          <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <Icon name="shield" className="size-6" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Admin login</h1>
          <p className="mt-1.5 text-sm text-stone-500">Sign in to open the project dashboard.</p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <Link href="/" className="mt-8 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800">
            <Icon name="arrowRight" className="size-3.5 rotate-180" />
            Back to website
          </Link>
        </div>
      </main>
    </div>
  );
}
