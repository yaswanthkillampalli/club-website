import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server' // Use the server client we just made

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/' // Where to redirect after login

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something went wrong, send them to an error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}