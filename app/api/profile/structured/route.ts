import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient } from '@/lib/supabase'
import { getCandidateProfile, upsertCandidateProfile } from '@/lib/db/candidate-profile'
import type { CandidateProfileData, EducationEntry } from '@/lib/types/database'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await getCandidateProfile(supabase, user.id)
  return NextResponse.json({ profile })
}

const strArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((s) => s.trim()) : []

// Persist user-reviewed fields and mark the structured profile approved/trusted.
export async function PUT(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null) as Partial<CandidateProfileData> | null
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid profile payload' }, { status: 400 })
  }

  const education: EducationEntry[] = Array.isArray(body.education)
    ? body.education
        .filter((e): e is EducationEntry => !!e && typeof e === 'object')
        .map((e) => ({ degree: String(e.degree ?? '').trim(), institution: String(e.institution ?? '').trim(), year: e.year ? String(e.year).trim() : null }))
        .filter((e) => e.degree || e.institution)
    : []

  const years = typeof body.years_experience === 'number' && isFinite(body.years_experience) ? body.years_experience : null

  try {
    const saved = await upsertCandidateProfile(supabase, user.id, {
      skills: strArr(body.skills),
      tools: strArr(body.tools),
      job_titles: strArr(body.job_titles),
      industries: strArr(body.industries),
      years_experience: years,
      seniority: body.seniority ? String(body.seniority).trim() : null,
      education,
      certifications: strArr(body.certifications),
      achievements: strArr(body.achievements),
      visa_signal: body.visa_signal ? String(body.visa_signal).trim() : null,
      status: 'approved',
    })
    return NextResponse.json({ profile: saved })
  } catch (err) {
    Sentry.captureException(err, { extra: { userId: user.id, feature: 'candidate_profile_save' } })
    return NextResponse.json({ error: 'Could not save your profile' }, { status: 500 })
  }
}
