import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient } from '@/lib/supabase'
import { getStripe, getPriceId } from '@/lib/stripe'

const logger = console

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let plan: string, interval: string, currency: string
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const body = await req.json() as { plan?: string; interval?: string; currency?: string }
    plan = body.plan ?? 'pro'
    interval = body.interval ?? 'month'
    currency = body.currency ?? 'gbp'
  } else {
    const form = await req.formData()
    plan = (form.get('plan') as string) ?? 'pro'
    interval = (form.get('interval') as string) ?? 'month'
    currency = (form.get('currency') as string) ?? 'gbp'
  }

  let priceId: string
  try {
    priceId = getPriceId(plan, interval, currency)
  } catch {
    return NextResponse.json({ error: 'Invalid plan or price not configured' }, { status: 400 })
  }

  const stripe = getStripe()
  const { data: profile } = await supabase.from('users').select('stripe_customer_id, name').eq('id', user.id).single()

  let customerId = profile?.stripe_customer_id ?? undefined
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: profile?.name ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/settings?tab=plan&upgraded=1`,
      cancel_url: `${origin}/settings?tab=plan`,
      allow_promotion_codes: true,
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    Sentry.setUser({ id: user.id })
    Sentry.captureException(err)
    logger.error('[billing/checkout] Stripe error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
