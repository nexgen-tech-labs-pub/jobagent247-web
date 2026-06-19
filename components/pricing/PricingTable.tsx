'use client'

import { useState } from 'react'
import { Check, X, Zap, Tag, Loader2 } from 'lucide-react'
import { PlanCta } from './PlanCta'

interface PromoState {
  code: string
  label: string  // e.g. "20% off forever" or "£10 off first month"
}

interface Plan {
  key: 'free' | 'pro' | 'accelerator'
  name: string
  priceMonth: string
  priceYear: string
  yearlyEqMonth: string
  desc: string
  features: string[]
  notIncluded: string[]
  cta: string
  highlight?: boolean
  badge?: string
}

interface Props {
  plans: Plan[]
  locale?: 'uk' | 'in'
}

function describePromo(p: {
  discountType: 'percent' | 'amount'
  percentOff: number | null
  amountOff: number | null
  currency: string | null
  duration: string
  durationInMonths: number | null
}): string {
  const sym = p.currency === 'usd' ? '$' : p.currency === 'inr' ? '₹' : '£'
  const head = p.discountType === 'percent'
    ? `${p.percentOff}% off`
    : `${sym}${((p.amountOff ?? 0) / 100).toFixed(2)} off`
  const tail =
    p.duration === 'forever' ? 'forever'
    : p.duration === 'once' ? 'on first payment'
    : `for ${p.durationInMonths ?? 0} months`
  return `${head} ${tail}`
}

export function PricingTable({ plans, locale = 'uk' }: Props) {
  const [interval, setInterval] = useState<'month' | 'year'>('month')
  const [codeInput, setCodeInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [promo, setPromo] = useState<PromoState | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)

  async function applyPromo() {
    const code = codeInput.trim().toUpperCase()
    if (!code) return
    setApplying(true)
    setPromoError(null)
    try {
      const res = await fetch('/api/billing/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok || data.valid === false) {
        setPromoError(data.error ?? 'Invalid code')
        setPromo(null)
      } else {
        setPromo({ code: data.code, label: describePromo(data) })
        setCodeInput('')
      }
    } catch {
      setPromoError('Could not verify code')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div>
      {/* Interval toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex p-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['month', 'year'] as const).map(opt => {
            const active = interval === opt
            return (
              <button
                key={opt}
                onClick={() => setInterval(opt)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-colors"
                style={{
                  background: active ? 'linear-gradient(135deg, #8B5CF6, #06B6D4)' : 'transparent',
                  color: active ? 'white' : '#94A3B8',
                }}
              >
                {opt === 'month' ? 'Monthly' : 'Yearly'}
                {opt === 'year' && (
                  <span className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ background: active ? 'rgba(255,255,255,0.2)' : 'rgba(34,197,94,0.15)', color: active ? 'white' : '#22C55E' }}>
                    Save 20%
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Promo code */}
      <div className="flex justify-center mb-10">
        {promo ? (
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <Tag className="w-4 h-4" style={{ color: '#22C55E' }} />
            <span className="text-sm font-medium" style={{ color: '#22C55E' }}>
              <span className="font-bold">{promo.code}</span> — {promo.label}
            </span>
            <button
              onClick={() => { setPromo(null); setPromoError(null) }}
              className="text-xs underline opacity-70 hover:opacity-100"
              style={{ color: '#22C55E' }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Tag className="w-3.5 h-3.5" style={{ color: '#94A3B8' }} />
              <input
                value={codeInput}
                onChange={e => setCodeInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') applyPromo() }}
                placeholder="Promo code"
                className="bg-transparent text-sm outline-none w-32"
                style={{ color: '#F8FAFC' }}
              />
              <button
                onClick={applyPromo}
                disabled={applying || !codeInput.trim()}
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.2)', color: '#A78BFA' }}
              >
                {applying ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
              </button>
            </div>
            {promoError && <p className="text-xs" style={{ color: '#EF4444' }}>{promoError}</p>}
          </div>
        )}
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const price = interval === 'month' ? plan.priceMonth : plan.priceYear
          const periodLabel = interval === 'month' ? '/month' : '/year'
          return (
            <div key={plan.key} className="glass-card p-8 flex flex-col relative"
              style={plan.highlight ? { border: '1px solid rgba(139,92,246,0.5)', boxShadow: '0 0 40px rgba(139,92,246,0.15)' } : {}}>
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: 'white' }}>
                  <Zap className="w-3 h-3" /> {plan.badge}
                </span>
              )}
              <div className="mb-6">
                <h3 className="font-heading font-bold text-xl text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-heading font-bold text-4xl text-white">{price}</span>
                  <span className="text-sm" style={{ color: '#64748B' }}>{periodLabel}</span>
                </div>
                {interval === 'year' && plan.key !== 'free' && (
                  <p className="text-xs mb-2" style={{ color: '#22C55E' }}>
                    Equivalent to {plan.yearlyEqMonth}/month
                  </p>
                )}
                <p className="text-sm" style={{ color: '#94A3B8' }}>{plan.desc}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#CBD5E1' }}>
                    <Check className="w-4 h-4 shrink-0" style={{ color: '#22C55E' }} />{f}
                  </li>
                ))}
                {plan.notIncluded.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#3F4A5A' }}>
                    <X className="w-4 h-4 shrink-0" style={{ color: '#3F4A5A' }} />{f}
                  </li>
                ))}
              </ul>
              <PlanCta
                plan={plan.key}
                interval={interval}
                label={plan.cta}
                highlight={plan.highlight}
                locale={locale}
                promoCode={promo?.code}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
