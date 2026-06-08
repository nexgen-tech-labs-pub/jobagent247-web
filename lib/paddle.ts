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
