import type { SupabaseClient } from '@supabase/supabase-js'

export type QuotaFeature =
  | 'cv_upload'
  | 'cv_analyse'
  | 'cv_improve'
  | 'job_match'
  | 'match_bulk'
  | 'cover_letter'
  | 'recruiter_message'
  | 'interview_prep'
  | 'interview_kit'
  | 'career_readiness'
  | 'job_fit'

const FREE_LIMITS: Record<QuotaFeature, number> = {
  cv_upload:         1,
  cv_analyse:        1,
  cv_improve:        1,
  job_match:         2,
  match_bulk:        2,
  cover_letter:      1,
  recruiter_message: 1,
  interview_prep:    1,
  interview_kit:     1,
  career_readiness:  1,
  job_fit:           2,
}

export async function checkQuota(
  supabase: SupabaseClient,
  userId: string,
  plan: 'free' | 'pro' | 'accelerator',
  feature: QuotaFeature,
  increment = true,
): Promise<{ allowed: boolean; remaining: number }> {
  if (plan !== 'free') return { allowed: true, remaining: 9999 }

  const limit = FREE_LIMITS[feature]

  const { data, error } = await supabase
    .from('users')
    .select('usage_counts')
    .eq('id', userId)
    .single()

  if (error || !data) return { allowed: false, remaining: 0 }

  const counts = (data.usage_counts as Record<string, number>) ?? {}
  const used = counts[feature] ?? 0

  if (used >= limit) return { allowed: false, remaining: 0 }

  if (increment) {
    const updated = { ...counts, [feature]: used + 1 }
    await supabase
      .from('users')
      .update({ usage_counts: updated })
      .eq('id', userId)
  }

  return { allowed: true, remaining: limit - used - (increment ? 1 : 0) }
}
