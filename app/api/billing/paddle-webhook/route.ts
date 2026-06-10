import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { type EventEntity, EventName } from '@paddle/paddle-node-sdk'
import { getPaddle, paddlePlanFromPriceId, creditPackFromPriceId } from '@/lib/paddle'
import { createAdminClient } from '@/lib/supabase'

const logger = console

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveUserIdFromCustomer(admin: any, customerId: string): Promise<string | null> {
  if (!customerId) return null
  const { data } = await admin
    .from('users')
    .select('id')
    .eq('paddle_customer_id', customerId)
    .maybeSingle()
  return data?.id ?? null
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('paddle-signature')
  const secret = process.env.PADDLE_WEBHOOK_SECRET

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: EventEntity
  try {
    event = await getPaddle().webhooks.unmarshal(body, secret, sig)
  } catch (err) {
    logger.error('[billing/paddle-webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    const type = event.eventType

    if (
      type === EventName.SubscriptionActivated ||
      type === EventName.SubscriptionUpdated ||
      type === EventName.SubscriptionCanceled
    ) {
      const sub = event.data
      const customerId: string = sub.customerId ?? ''
      const priceId: string = sub.items?.[0]?.price?.id ?? ''
      const status: string = sub.status ?? ''
      const newPlan =
        type === EventName.SubscriptionCanceled || status === 'canceled'
          ? 'free'
          : paddlePlanFromPriceId(priceId)

      const { error } = await admin
        .from('users')
        .update({ plan: newPlan })
        .eq('paddle_customer_id', customerId)

      if (error) {
        Sentry.captureException(error, { extra: { type, customerId } })
        logger.error('[billing/paddle-webhook] DB update failed:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      logger.log(`[billing/paddle-webhook] ${type} → plan=${newPlan} customer=${customerId}`)
    }

    if (type === EventName.TransactionCompleted) {
      const txn = event.data
      const customerId: string = txn.customerId ?? ''
      const customData = txn.customData as Record<string, string> | null
      const supabaseUserId: string = customData?.supabase_user_id ?? ''

      // Link paddle_customer_id on first transaction
      if (supabaseUserId && customerId) {
        await admin
          .from('users')
          .update({ paddle_customer_id: customerId })
          .eq('id', supabaseUserId)
          .is('paddle_customer_id', null)
      }

      // Credit pack one-time purchase — top up balance
      const priceId: string = txn.items?.[0]?.price?.id ?? ''
      const creditsToAdd = creditPackFromPriceId(priceId)
      const userId = supabaseUserId || await resolveUserIdFromCustomer(admin, customerId)

      if (creditsToAdd && userId) {
        const { data: userData } = await admin
          .from('users')
          .select('credits_balance')
          .eq('id', userId)
          .single()

        const current = (userData?.credits_balance as number) ?? 0
        await admin
          .from('users')
          .update({ credits_balance: current + creditsToAdd })
          .eq('id', userId)

        await admin.from('credit_transactions').insert({
          user_id: userId,
          delta: creditsToAdd,
          feature: null,
          description: `Purchased ${creditsToAdd} credits`,
          paddle_txn_id: txn.id ?? null,
        })

        logger.log(`[billing/paddle-webhook] credited ${creditsToAdd} to user=${userId}`)
      }
    }
  } catch (err) {
    Sentry.captureException(err, { extra: { eventType: event.eventType } })
    logger.error('[billing/paddle-webhook] Handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
