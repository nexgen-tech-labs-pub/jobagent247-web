import { NextResponse, after } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient, createAdminClient } from '@/lib/supabase'
import { getUserBillingContext } from '@/lib/db/users'
import { getDefaultMasterCV, getPrimaryCV, upsertDefaultMasterCV } from '@/lib/db/cvs'
import { generateAndStoreMasterCV, assertNotOnCooldown, MasterCvError } from '@/lib/cv/master'
import type { CV } from '@/lib/types/database'

const UPGRADE_MESSAGE =
  'Default Master CV is available for Pro and Accelerator members. Upgrade to generate your professionally optimised master CV.'

function isEligible(plan: string): boolean {
  return plan === 'pro' || plan === 'accelerator'
}

function toMetadata(cv: CV | null, eligible: boolean) {
  return {
    eligible,
    exists: !!cv,
    status: cv?.generation_status ?? null,
    stage: cv?.generation_stage ?? null,
    displayName: cv?.display_name ?? 'Default Master CV',
    atsScore: cv?.ats_score ?? null,
    targetRole: cv?.target_role ?? null,
    targetMarket: cv?.target_market ?? null,
    jobFamily: cv?.job_family ?? null,
    seniority: cv?.target_seniority ?? null,
    marketGaps: cv?.market_gaps ?? [],
    generatedAt: cv?.generated_at ?? null,
    error: cv?.generation_error ?? null,
    ready: cv?.generation_status === 'ready' && !!cv?.content_markdown,
  }
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await getUserBillingContext(supabase, user.id)
  const cv = await getDefaultMasterCV(supabase, user.id)
  return NextResponse.json(toMetadata(cv, isEligible(plan)))
}

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await getUserBillingContext(supabase, user.id)
  if (!isEligible(plan)) {
    return NextResponse.json({ error: UPGRADE_MESSAGE, code: 'PLAN_LIMIT' }, { status: 403 })
  }

  // Validate source CV synchronously so the user gets immediate, actionable feedback.
  const source = await getPrimaryCV(supabase, user.id)
  if (!source?.raw_text || source.raw_text.trim().length < 40) {
    return NextResponse.json(
      { error: 'Upload a CV before generating your Default Master CV.', code: 'NO_SOURCE_CV' },
      { status: 400 },
    )
  }

  try {
    await assertNotOnCooldown(supabase, user.id)
  } catch (err) {
    if (err instanceof MasterCvError && err.code === 'cooldown') {
      return NextResponse.json({ error: err.message, code: 'COOLDOWN' }, { status: 429 })
    }
    throw err
  }

  // Run generation in the background (Fluid Compute keeps the function alive after
  // the response). Use the admin client so the work is not tied to request auth.
  const admin = createAdminClient()
  await upsertDefaultMasterCV(admin, user.id, {
    generation_status: 'generating',
    generation_stage: 'queued',
    generation_error: null,
    membership_plan_at_generation: plan,
  })

  after(async () => {
    try {
      await generateAndStoreMasterCV(admin, user.id, plan)
    } catch (err) {
      Sentry.captureException(err, { extra: { userId: user.id, feature: 'master_cv' } })
    }
  })

  const cv = await getDefaultMasterCV(admin, user.id)
  return NextResponse.json(toMetadata(cv, true), { status: 202 })
}
