import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 1. Export the FUNCTION (For your new Components)
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey)
}

// 2. Export the STATIC INSTANCE (For your API files like resources.ts)
// This fixes the "Runtime Error" where files expect 'supabase' to be an object.
export const supabase = createClient();