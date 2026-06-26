'use client'

import { useEffect, useState } from 'react'
import { GradientButton } from '@/components/ui/GradientButton'
import { Loader2, Sparkles, Check } from 'lucide-react'

export function FoundingClaimCard() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [claimed, setClaimed] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/founding/spots')
        if (res.ok) {
          const { remaining } = await res.json() as { remaining: number }
          setRemaining(remaining)
        }
      } catch {
        // ignore — card just hides itself
      }
    })()
  }, [])

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/founding/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Could not claim spot')
        return
      }
      setClaimed(true)
      setTimeout(() => window.location.reload(), 1200)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (remaining === null || remaining <= 0) return null

  if (claimed) {
    return (
      <div
        className="p-5 rounded-2xl flex items-center gap-3"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(34,197,94,0.18)' }}
        >
          <Check className="w-5 h-5" style={{ color: '#22C55E' }} />
        </div>
        <div>
          <p className="font-medium text-white text-sm">Founding spot claimed.</p>
          <p className="text-xs" style={{ color: '#94A3B8' }}>Refreshing your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(139,92,246,0.18)' }}
        >
          <Sparkles className="w-5 h-5" style={{ color: '#A78BFA' }} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-white text-sm">Got a founding-member code?</p>
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
            Redeem it for 30 days of Pro free — no card required.{' '}
            <span style={{ color: '#A78BFA' }}>{remaining}</span> of 100 spots remaining.
          </p>
        </div>
      </div>

      <form onSubmit={handleClaim} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="FA-XXXX-XXXX"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none font-mono tracking-wide"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
        />
        <GradientButton type="submit" size="sm" disabled={submitting || !code.trim()}>
          {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Claiming…</> : 'Redeem'}
        </GradientButton>
      </form>

      {error && (
        <p className="text-xs mt-2" style={{ color: '#EF4444' }}>{error}</p>
      )}
    </div>
  )
}
