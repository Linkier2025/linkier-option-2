import { createClient } from '@supabase/supabase-js'

// Use public env vars so this works on the client as well
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Helpful runtime error: Next.js needs a dev server restart after adding .env.local
  // Ensure variables are defined in .env.local with NEXT_PUBLIC_ prefix
  console.error('Supabase env missing. NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set.')
  throw new Error('Missing Supabase environment variables. Add them to .env.local and restart the dev server.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
