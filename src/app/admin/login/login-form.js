"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/admin/actions";
import { Icon } from "@/components/icons";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state?.error && (
        <div role="alert" className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">
          <Icon name="alert" className="size-4 shrink-0" strokeWidth={2.2} />
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.email ?? ""}
          placeholder="you@example.com"
          className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-stone-700">
          Password
        </label>
        <div className="relative mt-1.5">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="block w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-3.5 pr-16 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-2 my-auto h-8 rounded-lg px-2.5 text-xs font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-800"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-medium text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <Icon name="arrowRight" className="size-4" strokeWidth={2.2} />
          </>
        )}
      </button>
    </form>
  );
}
