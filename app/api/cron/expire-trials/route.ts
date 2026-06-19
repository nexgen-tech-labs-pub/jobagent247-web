import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createAdminClient } from '@/lib/supabase'
import { getStripe } from '@/lib/stripe'

const logger = console

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due'])

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const stripe = getStripe()

  // Guard 1: only ever revert plan='pro' to free. accelerator users are paying
  // via Stripe and were never on the founding-member free trial — touching them
  // would silently downgrade real customers.
  const { data: candidates, error } = await admin
    .from('users')
    .select('id, stripe_customer_id, plan')
    .eq('founding_member', true)
    .eq('plan', 'pro')
    .not('trial_ends_at', 'is', null)
    .lt('trial_ends_at', new Date().toISOString())

  if (error) {
    Sentry.captureException(error)
    logger.error('[cron/expire-trials] DB error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ ok: true, expired: 0, skipped: 0 })
  }

  // Guard 2: skip anyone with an active Stripe subscription — they upgraded to
  // a real Pro plan during their trial and should not be reverted.
  const toRevert: string[] = []
  let skipped = 0

  for (const u of candidates) {
    if (!u.stripe_customer_id) {
      toRevert.push(u.id)
      continue
    }
    try {
      const subs = await stripe.subscriptions.list({
        customer: u.stripe_customer_id,
        status: 'all',
        limit: 5,
      })
      const hasActive = subs.data.some((s) => ACTIVE_SUBSCRIPTION_STATUSES.has(s.status))
      if (hasActive) {
        skipped++
      } else {
        toRevert.push(u.id)
      }
    } catch (subErr) {
      // If Stripe lookup fails, fail-safe: do NOT revert. Better to leave a Pro user
      // on Pro for another day than to wrongly downgrade a paying customer.
      Sentry.captureException(subErr)
      logger.warn('[cron/expire-trials] Stripe lookup failed for', u.id, '— skipping')
      skipped++
    }
  }

  if (toRevert.length === 0) {
    return NextResponse.json({ ok: true, expired: 0, skipped })
  }

  const { error: updErr } = await admin
    .from('users')
    .update({ plan: 'free' })
    .in('id', toRevert)

  if (updErr) {
    Sentry.captureException(updErr)
    logger.error('[cron/expire-trials] revert update error:', updErr)
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  logger.log('[cron/expire-trials] Reverted', toRevert.length, 'trials; kept', skipped, 'active subscribers')
  return NextResponse.json({ ok: true, expired: toRevert.length, skipped })
}
