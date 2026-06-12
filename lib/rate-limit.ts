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
  | 'career_growth'
  | 'app_insights'

// UK free-tier lifetime quotas
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
  career_growth:     1,
  app_insights:      1,
}

// India PAYG credit cost per feature
const INDIA_CREDIT_COSTS: Record<QuotaFeature, number> = {
  cv_upload:          0,   // uploading is free; analysis costs
  cv_analyse:         2,
  cv_improve:         3,
  job_match:          1,
  match_bulk:         2,
  cover_letter:       2,
  recruiter_message:  1,
  interview_prep:     1,
  interview_kit:      3,
  career_readiness:   2,
  job_fit:            1,
  career_growth:      3,
  app_insights:       2,
}

export async function checkQuota(
  supabase: SupabaseClient,
  userId: string,
  plan: 'free' | 'pro' | 'accelerator',
  feature: QuotaFeature,
  locale: 'uk' | 'in' = 'uk',
  increment = true,
): Promise<{ allowed: boolean; remaining: number }> {
  if (plan !== 'free') return { allowed: true, remaining: 9999 }

  if (locale === 'in') {
    return checkIndiaCredits(supabase, userId, feature, increment)
  }

  return checkUKQuota(supabase, userId, feature, increment)
}

async function checkUKQuota(
  supabase: SupabaseClient,
  userId: string,
  feature: QuotaFeature,
  increment: boolean,
): Promise<{ allowed: boolean; remaining: number }> {
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

async function checkIndiaCredits(
  supabase: SupabaseClient,
  userId: string,
  feature: QuotaFeature,
  increment: boolean,
): Promise<{ allowed: boolean; remaining: number }> {
  const cost = INDIA_CREDIT_COSTS[feature]

  if (cost === 0) return { allowed: true, remaining: 9999 }

  const { data, error } = await supabase
    .from('users')
    .select('credits_balance')
    .eq('id', userId)
    .single()

  if (error || !data) return { allowed: false, remaining: 0 }

  const balance = (data.credits_balance as number) ?? 0

  if (balance < cost) return { allowed: false, remaining: balance }

  if (increment) {
    const newBalance = balance - cost
    await supabase
      .from('users')
      .update({ credits_balance: newBalance })
      .eq('id', userId)

    await supabase.from('credit_transactions').insert({
      user_id: userId,
      delta: -cost,
      feature,
      description: `Used ${cost} credit${cost !== 1 ? 's' : ''} for ${feature.replace(/_/g, ' ')}`,
    })
  }

  return { allowed: true, remaining: balance - (increment ? cost : 0) }
}
