import { createClient } from "@supabase/supabase-js"

// Server-only client using Service Role key. Do NOT expose to the client.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set")
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
