import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserBillingContext } from '@/lib/db/users'
import { checkQuota } from '@/lib/rate-limit'
import { generateEvidenceBundle } from '@/lib/claude'
import type { EvidenceAssetType } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    targetRole?: string
    skillOrGap?: string
    assetType?: EvidenceAssetType
  }

  const targetRole = (body.targetRole ?? '').trim()
  const skillOrGap = (body.skillOrGap ?? '').trim()

  if (!targetRole) return NextResponse.json({ error: 'targetRole is required' }, { status: 400 })

  const { plan, locale } = await getUserBillingContext(supabase, user.id)
  const { allowed, code, lockedUntil } = await checkQuota(supabase, user.id, plan, 'evidence_build', locale)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Evidence build limit reached. Upgrade to Pro for unlimited evidence generation.', code, lockedUntil },
      { status: 429 },
    )
  }

  const { data: cv } = await supabase
    .from('cvs').select('raw_text')
    .eq('user_id', user.id).eq('is_primary', true).single()

  if (!cv?.raw_text) {
    return NextResponse.json(
      { error: 'No primary CV found. Upload a CV in the CV Agent first.' },
      { status: 422 },
    )
  }

  const bundle = await generateEvidenceBundle(cv.raw_text, targetRole, skillOrGap)
  return NextResponse.json({ bundle })
}
