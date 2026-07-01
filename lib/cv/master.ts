import type { SupabaseClient } from '@supabase/supabase-js'
import type { CV, CvGenerationStage } from '../types/database'
import { generateMasterCVMarkdown, analyseCVForRole } from '../claude'
import { classifyRole, getRoleProfile } from '../db/role-profiles'
import { getPrimaryCV, getDefaultMasterCV, upsertDefaultMasterCV } from '../db/cvs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

const ATS_TARGET = 90
export const ATS_SCORE_VERSION = 'jobagent247-ats-v1'
export const MARKET_SPEC_VERSION = 'role-kb-v1'
export const REGEN_COOLDOWN_MS = 60_000

export type Plan = 'free' | 'pro' | 'accelerator'

export class MasterCvError extends Error {
  constructor(public code: 'no_source_cv' | 'generation_failed' | 'cooldown', message: string) {
    super(message)
  }
}

interface Profile {
  current_role: string | null
  target_roles: string[] | null
  locale: 'uk' | 'in' | null
}

async function setStage(db: Client, userId: string, stage: CvGenerationStage): Promise<void> {
  await upsertDefaultMasterCV(db, userId, { generation_stage: stage })
}

/**
 * Generate (or regenerate) the user's Default Master CV from their first uploaded
 * CV and target profile, score it, run one safe improvement pass if below target,
 * and persist it as the default. Reports progress via generation_stage so the UI
 * can show a stepper while this runs in the background. Caller MUST enforce
 * Pro/Accelerator eligibility.
 */
export async function generateAndStoreMasterCV(db: Client, userId: string, plan: Plan): Promise<CV> {
  const { data: profile } = await db
    .from('users')
    .select('current_role, target_roles, locale')
    .eq('id', userId)
    .single<Profile>()

  const source = await getPrimaryCV(db, userId)
  if (!source?.raw_text || source.raw_text.trim().length < 40) {
    throw new MasterCvError('no_source_cv', 'Upload a CV before generating your Default Master CV.')
  }

  const targetRole = profile?.current_role || profile?.target_roles?.[0] || 'General'
  const targetMarket = profile?.locale === 'in' ? 'India' : 'UK'

  await upsertDefaultMasterCV(db, userId, {
    generation_status: 'generating',
    generation_stage: 'queued',
    generation_error: null,
    source_cv_id: source.id,
    target_role: targetRole,
    target_market: targetMarket,
    membership_plan_at_generation: plan,
  })

  try {
    await setStage(db, userId, 'parsing')

    // Best-effort role knowledge base for prioritisation, ATS pseudo-JD, and metadata.
    let roleContext: string | undefined
    let pseudoJd = `${targetRole} role in the ${targetMarket} market.`
    let jobFamily: string | null = null
    let seniority: string | null = null
    await setStage(db, userId, 'market')
    try {
      const classified = await classifyRole(targetRole, targetRole)
      jobFamily = classified.domain
      seniority = classified.seniority
      const roleProfile = await getRoleProfile(db, classified.domain, classified.seniority)
      if (roleProfile) {
        roleContext = `Role knowledge base for ${roleProfile.role_title}:\nKey tech stack: ${roleProfile.tech_stack.join(', ')}\nCommon ATS keywords: ${roleProfile.tech_stack.join(', ')}`
        pseudoJd = `Target role: ${roleProfile.role_title} (${classified.seniority} ${classified.domain}) in the ${targetMarket} market. Common required skills and keywords: ${roleProfile.tech_stack.join(', ')}.`
      }
    } catch { /* degrade gracefully — generation works without role context */ }

    await setStage(db, userId, 'optimising')
    let markdown = await generateMasterCVMarkdown({ cvText: source.raw_text, targetRole, targetMarket, roleContext })

    await setStage(db, userId, 'scoring')
    let ats = await analyseCVForRole(markdown, pseudoJd, targetRole, roleContext)

    // One safe improvement pass if below the ATS readiness target.
    if (ats.score < ATS_TARGET && ats.missingKeywords.length > 0) {
      await setStage(db, userId, 'optimising')
      const improved = await generateMasterCVMarkdown({
        cvText: source.raw_text,
        targetRole,
        targetMarket,
        roleContext,
        atsFeedback: ats.missingKeywords.join(', '),
      })
      const improvedAts = await analyseCVForRole(improved, pseudoJd, targetRole, roleContext)
      if (improvedAts.score >= ats.score) {
        markdown = improved
        ats = improvedAts
      }
    }

    await setStage(db, userId, 'formatting')
    // Remaining unmet keywords are surfaced as recommendations, never inserted as fake facts.
    const marketGaps = ats.score < ATS_TARGET ? ats.missingKeywords.slice(0, 8) : []

    return await upsertDefaultMasterCV(db, userId, {
      display_name: 'Default Master CV',
      content_markdown: markdown,
      ats_score: ats.score,
      ats_score_version: ATS_SCORE_VERSION,
      market_spec_version: MARKET_SPEC_VERSION,
      market_gaps: marketGaps,
      job_family: jobFamily,
      target_seniority: seniority,
      target_role: targetRole,
      target_market: targetMarket,
      source_cv_id: source.id,
      generation_status: 'ready',
      generation_stage: 'ready',
      generation_error: null,
      generated_at: new Date().toISOString(),
      last_regenerated_at: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    await upsertDefaultMasterCV(db, userId, { generation_status: 'failed', generation_error: message })
    throw new MasterCvError('generation_failed', message)
  }
}

/** Throws MasterCvError('cooldown') if a generation is in flight or ran too recently. */
export async function assertNotOnCooldown(db: Client, userId: string): Promise<void> {
  const cv = await getDefaultMasterCV(db, userId)
  if (!cv) return
  if (cv.generation_status === 'generating') {
    throw new MasterCvError('cooldown', 'Your Default Master CV is already being generated.')
  }
  const last = cv.last_regenerated_at ?? cv.generated_at
  if (last && Date.now() - new Date(last).getTime() < REGEN_COOLDOWN_MS) {
    throw new MasterCvError('cooldown', 'Please wait a moment before regenerating your Default Master CV.')
  }
}

export { getDefaultMasterCV }
