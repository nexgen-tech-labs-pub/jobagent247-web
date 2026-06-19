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
  | 'evidence_build'
  | 'follow_up_draft'
  | 'export'

export type QuotaCode = 'OK' | 'FEATURE_BLOCKED' | 'PLAN_LIMIT' | 'FREE_LOCKED'

export interface QuotaResult {
  allowed: boolean
  remaining: number
  code: QuotaCode
  lockedUntil?: number  // epoch ms, only when code === 'FREE_LOCKED'
}

// ─── Free UK lifetime limits ─────────────────────────────────────────────────
// 0 = feature not available on Free (upgrade required)

const FREE_LIMITS: Record<QuotaFeature, number> = {
  cv_upload:         1,
  cv_analyse:        3,
  cv_improve:        1,
  job_match:         3,
  match_bulk:        0,   // Pro+
  cover_letter:      2,
  recruiter_message: 2,
  interview_prep:    2,
  interview_kit:     1,
  career_readiness:  2,
  job_fit:           3,
  career_growth:     0,   // Pro+
  app_insights:      0,   // Pro+
  evidence_build:    0,   // Pro+
  follow_up_draft:   0,   // Pro+
  export:            1,
}

// Features that ARE available on Free (used for exhaustion check → 24h lock)
const FREE_GATED_FEATURES = (Object.entries(FREE_LIMITS) as [QuotaFeature, number][])
  .filter(([, limit]) => limit > 0)
  .map(([f]) => f)

// ─── Pro monthly limits ──────────────────────────────────────────────────────
// -1 = unlimited   0 = blocked on this plan

const PRO_MONTHLY_LIMITS: Record<QuotaFeature, number> = {
  cv_upload:         -1,
  cv_analyse:        -1,
  cv_improve:        -1,
  job_match:         50,
  match_bulk:        -1,
  cover_letter:      20,
  recruiter_message: 20,
  interview_prep:    10,
  interview_kit:     5,
  career_readiness:  1,   // one monthly refresh
  job_fit:           20,
  career_growth:     2,
  app_insights:      -1,
  evidence_build:    5,
  follow_up_draft:   10,
  export:            0,   // Accelerator only
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function checkQuota(
  supabase: SupabaseClient,
  userId: string,
  plan: 'free' | 'pro' | 'accelerator',
  feature: QuotaFeature,
  locale: 'uk' | 'in' = 'uk',
  increment = true,
): Promise<QuotaResult> {
  void locale  // all locales now use the same quota paths via Stripe subscriptions
  if (plan === 'accelerator') return { allowed: true, remaining: 9999, code: 'OK' }
  if (plan === 'pro') return checkProMonthly(supabase, userId, feature, increment)
  return checkFreeUK(supabase, userId, feature, increment)
}

// ─── Free UK ──────────────────────────────────────────────────────────────────

async function checkFreeUK(
  supabase: SupabaseClient,
  userId: string,
  feature: QuotaFeature,
  increment: boolean,
): Promise<QuotaResult> {
  const limit = FREE_LIMITS[feature]
  if (limit === 0) return { allowed: false, remaining: 0, code: 'FEATURE_BLOCKED' }

  const { data, error } = await supabase
    .from('users')
    .select('usage_counts')
    .eq('id', userId)
    .single()

  if (error || !data) return { allowed: false, remaining: 0, code: 'PLAN_LIMIT' }

  const counts = (data.usage_counts as Record<string, number>) ?? {}

  // 24h lock check
  const lockedUntil = counts['_free_locked_until']
  if (lockedUntil && Date.now() < lockedUntil) {
    return { allowed: false, remaining: 0, code: 'FREE_LOCKED', lockedUntil }
  }

  const used = counts[feature] ?? 0

  if (used >= limit) {
    // Check if ALL available free features are now exhausted → apply 24h lock
    const allExhausted = FREE_GATED_FEATURES.every(f => (counts[f] ?? 0) >= FREE_LIMITS[f])
    if (allExhausted) {
      const lockUntil = Date.now() + 24 * 60 * 60 * 1000
      await supabase
        .from('users')
        .update({ usage_counts: { ...counts, _free_locked_until: lockUntil } })
        .eq('id', userId)
      return { allowed: false, remaining: 0, code: 'FREE_LOCKED', lockedUntil: lockUntil }
    }
    return { allowed: false, remaining: 0, code: 'PLAN_LIMIT' }
  }

  if (increment) {
    const updated: Record<string, number> = { ...counts, [feature]: used + 1 }

    // After this use, check if all free features are now exhausted
    const nowExhausted = FREE_GATED_FEATURES.every(f => (updated[f] ?? 0) >= FREE_LIMITS[f])
    if (nowExhausted) {
      updated['_free_locked_until'] = Date.now() + 24 * 60 * 60 * 1000
    }

    await supabase.from('users').update({ usage_counts: updated }).eq('id', userId)
  }

  return { allowed: true, remaining: limit - used - (increment ? 1 : 0), code: 'OK' }
}

// ─── Pro monthly ──────────────────────────────────────────────────────────────

function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

async function checkProMonthly(
  supabase: SupabaseClient,
  userId: string,
  feature: QuotaFeature,
  increment: boolean,
): Promise<QuotaResult> {
  const monthLimit = PRO_MONTHLY_LIMITS[feature]
  if (monthLimit === 0) return { allowed: false, remaining: 0, code: 'FEATURE_BLOCKED' }
  if (monthLimit === -1) return { allowed: true, remaining: 9999, code: 'OK' }

  const monthKey = `pro_${currentMonthKey()}_${feature}`

  const { data, error } = await supabase
    .from('users')
    .select('usage_counts')
    .eq('id', userId)
    .single()

  if (error || !data) return { allowed: false, remaining: 0, code: 'PLAN_LIMIT' }

  const counts = (data.usage_counts as Record<string, number>) ?? {}
  const used = counts[monthKey] ?? 0

  if (used >= monthLimit) return { allowed: false, remaining: 0, code: 'PLAN_LIMIT' }

  if (increment) {
    await supabase
      .from('users')
      .update({ usage_counts: { ...counts, [monthKey]: used + 1 } })
      .eq('id', userId)
  }

  return { allowed: true, remaining: monthLimit - used - (increment ? 1 : 0), code: 'OK' }
}

