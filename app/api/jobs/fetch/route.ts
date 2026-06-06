import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUser } from '@/lib/db/users'
import { triggerApifyRun } from '@/lib/apify'

const logger = console  // swap for Sentry logger in Phase 5

export async function POST(_req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await getUser(supabase, user.id)

  const targetRole = profile?.target_roles?.[0]
  if (!targetRole) {
    return NextResponse.json(
      { error: 'Complete your profile to use Find Jobs' },
      { status: 400 }
    )
  }

  const location = profile.location_pref ?? 'United Kingdom'
  const remoteOnly = profile.job_type_pref?.toLowerCase() === 'remote'

  const linkedinId = process.env.APIFY_ACTOR_LINKEDIN ?? 'bebity/linkedin-jobs-scraper'
  const indeedId   = process.env.APIFY_ACTOR_INDEED   ?? 'misceres/indeed-scraper'

  const linkedinInput = {
    keywords: targetRole,
    location,
    remote: remoteOnly,
    maxResults: 25,
  }
  const indeedInput = {
    position: targetRole,
    country: 'UK',
    location,
    maxItems: 25,
  }

  try {
    const [linkedinRunId, indeedRunId] = await Promise.all([
      triggerApifyRun(linkedinId, linkedinInput),
      triggerApifyRun(indeedId, indeedInput),
    ])
    return NextResponse.json({
      runs: [
        { runId: linkedinRunId, source: 'LinkedIn' },
        { runId: indeedRunId, source: 'Indeed' },
      ],
    })
  } catch (err) {
    logger.error('[jobs/fetch] Apify trigger error:', err)
    return NextResponse.json({ error: 'Failed to start job search' }, { status: 500 })
  }
}
