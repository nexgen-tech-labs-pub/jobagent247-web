import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import Stripe from 'stripe'
import { getStripe, planFromSubscription } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'

const logger = console

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    logger.error('[billing/stripe-webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const priceId = sub.items.data[0]?.price.id ?? ''
      const newPlan = planFromSubscription(sub.status, priceId)

      const { error } = await admin
        .from('users')
        .update({ plan: newPlan })
        .eq('stripe_customer_id', customerId)

      if (error) {
        Sentry.captureException(error, { extra: { event: event.type, customerId } })
        logger.error('[billing/stripe-webhook] DB update failed:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      logger.log(`[billing/stripe-webhook] ${event.type} → plan=${newPlan} customer=${customerId}`)
    }
  } catch (err) {
    Sentry.captureException(err, { extra: { event: event.type } })
    logger.error('[billing/stripe-webhook] Handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
