import Stripe from 'stripe'

const STRIPE_API_VERSION = '2026-05-27.dahlia' as const

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  })
}

const PRICE_IDS: Record<string, Record<string, Record<string, string>>> = {
  pro: {
    month: {
      gbp: process.env.STRIPE_PRO_MONTHLY_GBP ?? '',
      usd: process.env.STRIPE_PRO_MONTHLY_USD ?? '',
      inr: process.env.STRIPE_PRO_MONTHLY_INR ?? '',
    },
    year: {
      gbp: process.env.STRIPE_PRO_YEARLY_GBP ?? '',
      usd: process.env.STRIPE_PRO_YEARLY_USD ?? '',
      inr: process.env.STRIPE_PRO_YEARLY_INR ?? '',
    },
  },
  accelerator: {
    month: {
      gbp: process.env.STRIPE_ACCELERATOR_MONTHLY_GBP ?? '',
      usd: process.env.STRIPE_ACCELERATOR_MONTHLY_USD ?? '',
      inr: process.env.STRIPE_ACCELERATOR_MONTHLY_INR ?? '',
    },
    year: {
      gbp: process.env.STRIPE_ACCELERATOR_YEARLY_GBP ?? '',
      usd: process.env.STRIPE_ACCELERATOR_YEARLY_USD ?? '',
      inr: process.env.STRIPE_ACCELERATOR_YEARLY_INR ?? '',
    },
  },
}

export function getPriceId(plan: string, interval: string, currency: string): string {
  const id = PRICE_IDS[plan]?.[interval]?.[currency]
  if (!id) throw new Error(`No price ID configured for ${plan}/${interval}/${currency}`)
  return id
}

export function planFromSubscription(status: string, priceId: string): 'free' | 'pro' | 'accelerator' {
  if (status !== 'active' && status !== 'trialing') return 'free'
  const allPro = Object.values(PRICE_IDS.pro).flatMap(c => Object.values(c))
  const allAccel = Object.values(PRICE_IDS.accelerator).flatMap(c => Object.values(c))
  if (allAccel.includes(priceId)) return 'accelerator'
  if (allPro.includes(priceId)) return 'pro'
  return 'free'
}
