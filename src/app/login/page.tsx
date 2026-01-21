'use client'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, UserPlus } from 'lucide-react'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      // REGISTER (Email + Password)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Pass the "username" (part before @) to the profile trigger
          data: {
            full_name: email.split('@')[0], 
            user_name: email.split('@')[0],
          }
        },
      })

      if (error) {
        setMessage(error.message)
      } else {
        // Since email confirmation is OFF, we can just log them in or tell them to login
        setMessage("Account created! Logging you in...")
        await supabase.auth.signInWithPassword({ email, password })
        router.refresh()
        router.push('/profile')
      }
    } else {
      // LOGIN
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setMessage(error.message)
      } else {
        router.refresh()
        router.push('/profile')
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 mb-4">
            {isSignUp ? <UserPlus className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <h2 className="text-3xl font-bold tracking-tighter text-white">
            {isSignUp ? 'Initialize Identity' : 'System Access'}
          </h2>
          <p className="mt-2 text-sm text-gray-400 font-mono">
            {isSignUp ? 'Create a secure account.' : 'Enter credentials to proceed.'}
          </p>
        </div>

        {/* The Form */}
        <form onSubmit={handleAuth} className="space-y-4 mt-8">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition"
            />
          </div>

          {message && (
            <div className={`p-3 rounded text-sm text-center font-bold ${
              message.includes('Account created') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isSignUp ? 'CREATE ACCOUNT' : 'LOGIN'} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {isSignUp ? 'Already have access? ' : "Need an account? "}
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
            className="text-blue-400 hover:underline font-bold"
          >
            {isSignUp ? 'Log In' : 'Register Now'}
          </button>
        </div>

      </div>
    </div>
  )
}