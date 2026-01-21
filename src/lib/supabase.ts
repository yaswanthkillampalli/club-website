import { createClient } from '@supabase/supabase-js'

// 1. Load keys from the environment file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 2. Safety check: Ensure keys exist before crashing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables')
}

// 3. Create and export the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)