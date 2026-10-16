"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, safeEqual } from "@/lib/session";

export async function login(_prevState, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  const validEmail = safeEqual(email, (process.env.ADMIN_EMAIL ?? "").toLowerCase());
  const validPassword = safeEqual(password, process.env.ADMIN_PASSWORD ?? "");
  if (!validEmail || !validPassword) {
    return { error: "Incorrect email or password.", email };
  }

  (await cookies()).set(SESSION_COOKIE, createSessionToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/dashboard");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
