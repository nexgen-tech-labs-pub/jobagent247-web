import type { SupabaseClient } from '@supabase/supabase-js'
import type { CandidateProfile } from '../types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export async function getCandidateProfile(db: Client, userId: string): Promise<CandidateProfile | null> {
  const { data } = await db.from('candidate_profiles').select('*').eq('user_id', userId).maybeSingle()
  return (data as CandidateProfile | null) ?? null
}

/** The user-approved structured profile, for consumption by matching/application flows. */
export async function getApprovedCandidateProfile(db: Client, userId: string): Promise<CandidateProfile | null> {
  const { data } = await db
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .maybeSingle()
  return (data as CandidateProfile | null) ?? null
}

/**
 * The user-approved structured profile formatted as supplemental context for
 * matching / application-generation prompts. Returns null when no approved
 * profile exists so callers degrade gracefully.
 */
export async function getApprovedProfileContext(db: Client, userId: string): Promise<string | null> {
  const p = await getApprovedCandidateProfile(db, userId)
  if (!p) return null
  const lines = [
    p.skills.length && `Confirmed skills: ${p.skills.join(', ')}`,
    p.tools.length && `Confirmed tools/technologies: ${p.tools.join(', ')}`,
    p.job_titles.length && `Held job titles: ${p.job_titles.join(', ')}`,
    p.industries.length && `Industries: ${p.industries.join(', ')}`,
    p.seniority && `Seniority: ${p.seniority}`,
    p.years_experience != null && `Years of experience: ${p.years_experience}`,
    p.certifications.length && `Certifications: ${p.certifications.join(', ')}`,
  ].filter(Boolean)
  return lines.length ? `Candidate confirmed profile (user-approved):\n${lines.join('\n')}` : null
}

export async function upsertCandidateProfile(
  db: Client,
  userId: string,
  payload: Partial<Omit<CandidateProfile, 'id' | 'user_id' | 'created_at'>>,
): Promise<CandidateProfile> {
  const existing = await getCandidateProfile(db, userId)
  const row = { ...payload, updated_at: new Date().toISOString() }
  if (existing) {
    const { data, error } = await db.from('candidate_profiles').update(row).eq('user_id', userId).select().single()
    if (error) throw error
    return data as CandidateProfile
  }
  const { data, error } = await db.from('candidate_profiles').insert({ user_id: userId, ...row }).select().single()
  if (error) throw error
  return data as CandidateProfile
}
