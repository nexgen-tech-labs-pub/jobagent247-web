import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserBillingContext } from '@/lib/db/users'
import { checkQuota } from '@/lib/rate-limit'
import { generateGrowthPlan } from '@/lib/claude'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { targetRole: string }
  if (!body.targetRole?.trim()) {
    return NextResponse.json({ error: 'targetRole is required' }, { status: 400 })
  }

  try {
    const { plan, locale } = await getUserBillingContext(supabase, user.id)
    const { allowed, remaining } = await checkQuota(supabase, user.id, plan, 'career_growth', locale)
    if (!allowed) {
      return NextResponse.json({ error: 'Growth plan limit reached. Upgrade for more.', remaining: 0 }, { status: 429 })
    }

    const { data: cv } = await supabase
      .from('cvs')
      .select('raw_text')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()
    if (!cv?.raw_text) {
      return NextResponse.json({ error: 'No primary CV found. Please upload your CV first.' }, { status: 400 })
    }

    const { data: readiness } = await supabase
      .from('readiness_analyses')
      .select('overall_score, score_breakdown')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const growthPlan = await generateGrowthPlan(
      cv.raw_text,
      body.targetRole.trim(),
      readiness?.overall_score ?? null,
      readiness?.score_breakdown ?? null,
    )

    return NextResponse.json({ plan: growthPlan, remaining })
  } catch {
    return NextResponse.json({ error: 'Failed to generate growth plan. Please try again.' }, { status: 500 })
  }
}
