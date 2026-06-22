import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

type Plan = 'free' | 'pro' | 'accelerator'

interface Props {
  plan: Plan
  locale?: 'uk' | 'in'
  variant?: 'wide' | 'compact'
}

const PRO_PRICE: Record<'uk' | 'in', string> = {
  uk: '£9.99/mo',
  in: '₹500/mo',
}

export function FreeTierBanner({ plan, locale = 'uk', variant = 'wide' }: Props) {
  if (plan !== 'free') return null

  if (variant === 'compact') {
    return (
      <Link
        href="/settings?tab=plan"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08))',
          border: '1px solid rgba(139,92,246,0.3)',
          color: '#CBD5E1',
        }}
      >
        <Sparkles className="w-3 h-3" style={{ color: '#8B5CF6' }} />
        <span><span className="text-white font-semibold">Free Plan</span> · Upgrade to Pro</span>
        <ArrowRight className="w-3 h-3 opacity-70" />
      </Link>
    )
  }

  return (
    <div
      className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08))',
        border: '1px solid rgba(139,92,246,0.3)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(139,92,246,0.18)' }}
        >
          <Sparkles className="w-5 h-5" style={{ color: '#8B5CF6' }} />
        </div>
        <div>
          <p className="font-heading font-semibold text-white text-sm">
            You&apos;re on the Free plan
          </p>
          <p className="text-sm mt-0.5" style={{ color: '#CBD5E1' }}>
            Upgrade to Pro for unlimited CV rewrites, job matching, and cover letters — from {PRO_PRICE[locale]}.
          </p>
        </div>
      </div>
      <Link
        href="/settings?tab=plan"
        className="btn-gradient text-sm px-4 py-2 shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap"
      >
        Upgrade <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
