import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createAdminClient } from '@/lib/supabase'

const logger = console

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('users')
    .update({ plan: 'free' })
    .eq('founding_member', true)
    .not('trial_ends_at', 'is', null)
    .lt('trial_ends_at', new Date().toISOString())
    .neq('plan', 'free')
    .select('id')

  if (error) {
    Sentry.captureException(error)
    logger.error('[cron/expire-trials] DB error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const expired = data?.length ?? 0
  logger.log('[cron/expire-trials] Expired', expired, 'founding member trials')
  return NextResponse.json({ ok: true, expired })
}
