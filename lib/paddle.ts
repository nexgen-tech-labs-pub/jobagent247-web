import { Paddle, Environment } from '@paddle/paddle-node-sdk'

export function getPaddle(): Paddle {
  if (!process.env.PADDLE_API_KEY) throw new Error('PADDLE_API_KEY is not set')
  return new Paddle(process.env.PADDLE_API_KEY, {
    environment:
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
        ? Environment.production
        : Environment.sandbox,
  })
}

const PADDLE_PRICE_IDS: Record<string, Record<string, string>> = {
  pro: {
    month: process.env.PADDLE_PRO_MONTHLY_INR ?? '',
    year: process.env.PADDLE_PRO_YEARLY_INR ?? '',
  },
  accelerator: {
    month: process.env.PADDLE_ACCELERATOR_MONTHLY_INR ?? '',
    year: process.env.PADDLE_ACCELERATOR_YEARLY_INR ?? '',
  },
}

// India PAYG credit packs — one-time purchase price IDs
export const PADDLE_CREDIT_PACKS: { priceId: string; credits: number; label: string }[] = [
  { priceId: process.env.PADDLE_CREDITS_10_INR ?? '', credits: 10,  label: '10 credits — ₹99'  },
  { priceId: process.env.PADDLE_CREDITS_25_INR ?? '', credits: 25,  label: '25 credits — ₹199' },
  { priceId: process.env.PADDLE_CREDITS_60_INR ?? '', credits: 60,  label: '60 credits — ₹399' },
]

export function creditPackFromPriceId(priceId: string): number | null {
  const pack = PADDLE_CREDIT_PACKS.find(p => p.priceId === priceId && p.priceId !== '')
  return pack ? pack.credits : null
}

export function getPaddlePriceId(plan: string, interval: string): string {
  const id = PADDLE_PRICE_IDS[plan]?.[interval]
  if (!id) throw new Error(`No Paddle price ID configured for ${plan}/${interval}`)
  return id
}

export function paddlePlanFromPriceId(priceId: string): 'free' | 'pro' | 'accelerator' {
  const proIds = Object.values(PADDLE_PRICE_IDS.pro)
  const accelIds = Object.values(PADDLE_PRICE_IDS.accelerator)
  if (accelIds.includes(priceId)) return 'accelerator'
  if (proIds.includes(priceId)) return 'pro'
  return 'free'
}
