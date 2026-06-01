'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, Loader2, Check } from 'lucide-react'
import { GradientButton } from '@/components/ui/GradientButton'
import { getBrowserClient } from '@/lib/supabase-browser'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = getBrowserClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="flex items-center gap-2 font-heading font-bold text-[color:var(--foreground)] mb-10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        JobAgent247
      </div>

      <div className="w-full max-w-md rounded-2xl p-8 space-y-6"
        style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.10)' }}>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <Check className="w-6 h-6" style={{ color: '#22C55E' }} />
            </div>
            <h2 className="font-heading font-bold text-xl text-[color:var(--foreground)]">Check your email</h2>
            <p className="text-sm" style={{ color: '#64748B' }}>
              We sent a password reset link to <span className="font-medium text-[color:var(--foreground)]">{email}</span>.
            </p>
            <Link href="/login" className="block text-sm font-medium" style={{ color: '#8B5CF6' }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="font-heading font-bold text-2xl text-[color:var(--foreground)]">Reset your password</h1>
              <p className="text-sm mt-1" style={{ color: '#64748B' }}>
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#94A3B8' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-[color:var(--foreground)] outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                />
              </div>

              {error && (
                <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </p>
              )}

              <GradientButton type="submit" disabled={loading} size="md" className="w-full justify-center">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send reset link'}
              </GradientButton>
            </form>
          </>
        )}
      </div>

      <p className="mt-6 text-sm" style={{ color: '#64748B' }}>
        Remember your password?{' '}
        <Link href="/login" className="font-medium" style={{ color: '#8B5CF6' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
