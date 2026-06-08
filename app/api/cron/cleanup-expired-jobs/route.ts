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
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await admin
    .from('jobs')
    .delete()
    .lt('scraped_at', cutoff)

  if (error) {
    Sentry.captureException(error)
    logger.error('[cron/cleanup] DB error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  logger.log('[cron/cleanup] Deleted expired jobs older than', cutoff)
  return NextResponse.json({ ok: true, cutoff })
}
