'use client'

import { useEffect, useState } from 'react'
import { Star, X } from 'lucide-react'

interface Props {
  trialEndsAt: string
}

export function FoundingMemberBanner({ trialEndsAt }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [daysLeft, setDaysLeft] = useState(0)

  useEffect(() => {
    const ms = new Date(trialEndsAt).getTime() - Date.now()
    setDaysLeft(Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24))))
  }, [trialEndsAt])

  if (dismissed || daysLeft <= 0) return null

  return (
    <div className="relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(6,182,212,0.12))',
        border: '1px solid rgba(139,92,246,0.35)',
      }}>
      <Star className="w-4 h-4 shrink-0" style={{ color: '#8B5CF6' }} />
      <span style={{ color: '#E2E8F0' }}>
        <span className="font-bold" style={{ color: '#A78BFA' }}>Founding Member</span>
        {' '}— you have full Pro access free for{' '}
        <span className="font-bold" style={{ color: '#06B6D4' }}>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>.
        {' '}Upgrade before it expires to lock in your rate.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto p-1 rounded-lg transition-colors hover:bg-white/10 shrink-0"
        style={{ color: '#64748B' }}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
