import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client. Uses the secret key, which bypasses row-level
// security — only import this from server code, never from a "use client" file.
let client;

export function supabaseAdmin() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set");
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
