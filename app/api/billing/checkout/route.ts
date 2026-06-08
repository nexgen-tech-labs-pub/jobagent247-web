import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient } from '@/lib/supabase'
import { getStripe, getPriceId } from '@/lib/stripe'
import { getPaddle, getPaddlePriceId } from '@/lib/paddle'

const logger = console

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { plan?: string; interval?: string }
  const plan = body.plan ?? 'pro'
  const interval = body.interval ?? 'month'

  const { data: profile } = await supabase
    .from('users')
    .select('locale, stripe_customer_id, paddle_customer_id, name')
    .eq('id', user.id)
    .single()

  if (profile?.locale === 'in') {
    let priceId: string
    try {
      priceId = getPaddlePriceId(plan, interval)
    } catch {
      return NextResponse.json({ error: 'Invalid plan or price not configured' }, { status: 400 })
    }

    try {
      const paddle = getPaddle()
      const transaction = await paddle.transactions.create({
        items: [{ priceId, quantity: 1 }],
        customData: { supabase_user_id: user.id },
        ...(profile?.paddle_customer_id ? { customerId: profile.paddle_customer_id } : {}),
      })
      return NextResponse.json({ provider: 'paddle', transactionId: transaction.id })
    } catch (err) {
      Sentry.setUser({ id: user.id })
      Sentry.captureException(err)
      logger.error('[billing/checkout] Paddle error:', err)
      return NextResponse.json({ error: 'Failed to create Paddle transaction' }, { status: 500 })
    }
  }

  let priceId: string
  try {
    priceId = getPriceId(plan, interval, 'gbp')
  } catch {
    return NextResponse.json({ error: 'Invalid plan or price not configured' }, { status: 400 })
  }

  const stripe = getStripe()

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
    return NextResponse.json({ provider: 'stripe', url: session.url })
  } catch (err) {
    Sentry.setUser({ id: user.id })
    Sentry.captureException(err)
    logger.error('[billing/checkout] Stripe error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
