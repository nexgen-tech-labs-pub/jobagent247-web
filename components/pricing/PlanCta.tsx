'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { getBrowserClient } from '@/lib/supabase-browser'

interface Props {
  plan: 'free' | 'pro' | 'accelerator'
  interval: 'month' | 'year'
  label: string
  highlight?: boolean
  locale?: 'uk' | 'in'
}

export function PlanCta({ plan, interval, label, highlight, locale = 'uk' }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const Button = highlight ? GradientButton : SecondaryButton
  const signupHref = locale === 'in' ? '/in/signup' : '/signup'

  async function handleClick() {
    if (plan === 'free') {
      router.push(signupHref)
      return
    }

    setLoading(true)
    try {
      const supabase = getBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`${signupHref}?plan=${plan}&interval=${interval}`)
        return
      }

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || data.error) throw new Error(data.error ?? 'Checkout failed')
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('[PlanCta]', err)
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} className="w-full justify-center" disabled={loading}>
      {loading ? 'Processing…' : label}
    </Button>
  )
}
