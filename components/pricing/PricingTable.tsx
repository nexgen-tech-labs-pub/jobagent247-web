'use client'

import { useState } from 'react'
import { Check, X, Zap } from 'lucide-react'
import { PlanCta } from './PlanCta'

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

export function PricingTable({ plans, locale = 'uk' }: Props) {
  const [interval, setInterval] = useState<'month' | 'year'>('month')

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
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
