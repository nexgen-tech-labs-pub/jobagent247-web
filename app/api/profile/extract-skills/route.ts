import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient } from '@/lib/supabase'
import { extractProfileSkills } from '@/lib/claude'

const logger = console

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Pick the primary CV, fall back to the most recently uploaded one.
  const { data: cvs, error: cvErr } = await supabase
    .from('cvs')
    .select('id, raw_text, is_primary')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)

  if (cvErr) {
    Sentry.captureException(cvErr)
    return NextResponse.json({ error: cvErr.message }, { status: 500 })
  }

  const cv = cvs?.[0]
  if (!cv?.raw_text) {
    return NextResponse.json(
      { error: 'Upload a CV first — the Profile Agent reads it to suggest skills.' },
      { status: 400 },
    )
  }

  try {
    const skills = await extractProfileSkills(cv.raw_text)
    return NextResponse.json({
      cvId: cv.id,
      topSkills: skills.topSkills,
      experienceLevel: skills.experienceLevel,
      preferredDomains: skills.preferredDomains,
      yearsExperience: skills.yearsExperience,
    })
  } catch (err) {
    Sentry.setUser({ id: user.id })
    Sentry.captureException(err)
    logger.error('[profile/extract-skills]', err)
    return NextResponse.json({ error: 'Profile Agent failed to read CV — try again.' }, { status: 500 })
  }
}
