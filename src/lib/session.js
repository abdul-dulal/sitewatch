import { createHmac, timingSafeEqual } from "node:crypto";

// Signed-cookie session for the admin dashboard.
// Token format: base64url(JSON payload) + "." + HMAC-SHA256 signature.

export const SESSION_COOKIE = "sw_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return value;
}

function sign(data) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionToken(email) {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + SESSION_MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

// Returns { email } for a valid, unexpired token, otherwise null.
export function verifySessionToken(token) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(signature, sign(payload))) return null;

  try {
    const { email, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof exp !== "number" || exp < Date.now()) return null;
    return { email };
  } catch {
    return null;
  }
}

export function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}
