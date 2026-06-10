import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUser } from '@/lib/db/users'
import { runJobSearch } from '@/lib/job-sources'

const logger = console  // swap for Sentry logger in Phase 5

export async function POST() {
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

  const locale = profile.locale ?? 'uk'
  const location = profile.location_pref ?? (locale === 'in' ? 'India' : 'United Kingdom')
  const remoteOnly = profile.job_type_pref?.toLowerCase() === 'remote'

  try {
    const runs = await runJobSearch({
      targetRole,
      location,
      remoteOnly,
      locale,
      userId: user.id,
    })
    return NextResponse.json({ runs })
  } catch (err) {
    const apifyType = (err as Error & { apifyType?: string }).apifyType ?? ''
    logger.error('[jobs/fetch] error:', apifyType, err instanceof Error ? err.message : err)

    if (apifyType === 'actor-is-not-rented') {
      return NextResponse.json(
        { error: 'Job scraping actors require a paid Apify subscription. Please rent the actors or contact support.' },
        { status: 503 }
      )
    }
    if (err instanceof Error && err.message.includes('APIFY_API_TOKEN')) {
      return NextResponse.json(
        { error: 'Job scraping is not configured. APIFY_API_TOKEN is missing.' },
        { status: 503 }
      )
    }
    if (err instanceof Error && (err.message.includes('GCP_CLOUD_RUN_URL') || err.message.includes('CLOUD_TASKS_HANDLER_TOKEN'))) {
      return NextResponse.json(
        { error: 'Job scraping is not configured. Cloud Run credentials are missing.' },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: 'Failed to start job search. Please try again.' }, { status: 500 })
  }
}
