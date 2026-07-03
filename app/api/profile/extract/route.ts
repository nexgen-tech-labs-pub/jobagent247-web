import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient } from '@/lib/supabase'
import { getPrimaryCV } from '@/lib/db/cvs'
import { upsertCandidateProfile } from '@/lib/db/candidate-profile'
import { extractCandidateProfile } from '@/lib/claude'

// Extract a structured candidate profile from the user's primary CV.
// Stored as a 'draft' for the user to review/edit before it becomes trusted.
export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cv = await getPrimaryCV(supabase, user.id)
  if (!cv?.raw_text || cv.raw_text.trim().length < 40) {
    return NextResponse.json({ error: 'Upload a CV before extracting your profile.', code: 'NO_SOURCE_CV' }, { status: 400 })
  }

  const { data: hintRow } = await supabase
    .from('users')
    .select('current_role, target_roles, location')
    .eq('id', user.id)
    .single<{ current_role: string | null; target_roles: string[] | null; location: string | null }>()
  const hints = hintRow
    ? [hintRow.current_role && `Current role: ${hintRow.current_role}`, hintRow.target_roles?.length && `Target roles: ${hintRow.target_roles.join(', ')}`, hintRow.location && `Location: ${hintRow.location}`]
        .filter(Boolean).join('\n')
    : undefined

  try {
    const extracted = await extractCandidateProfile(cv.raw_text, hints || undefined)
    const saved = await upsertCandidateProfile(supabase, user.id, {
      ...extracted,
      source_cv_id: cv.id,
      status: 'draft',
      extracted_at: new Date().toISOString(),
    })
    return NextResponse.json({ profile: saved })
  } catch (err) {
    Sentry.setUser({ id: user.id })
    Sentry.captureException(err, { extra: { feature: 'candidate_profile_extract' } })
    return NextResponse.json({ error: 'Profile extraction failed. Please try again.' }, { status: 500 })
  }
}
