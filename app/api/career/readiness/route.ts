import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserPlan, getUser } from '@/lib/db/users'
import { checkRateLimit } from '@/lib/rate-limit'
import { analyseReadiness } from '@/lib/claude'
import { saveReadinessAnalysis } from '@/lib/db/readiness'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    targetJobTitle: string
    targetSeniority?: string
    targetGeography?: string
    linkedinText?: string
    portfolioLinks?: string[]
  }

  if (!body.targetJobTitle?.trim()) {
    return NextResponse.json({ error: 'targetJobTitle is required' }, { status: 400 })
  }

  try {
    const plan = await getUserPlan(supabase, user.id)
    const { allowed, remaining } = await checkRateLimit(user.id, plan)
    if (!allowed) {
      return NextResponse.json({ error: 'Daily limit reached. Upgrade for more.', remaining: 0 }, { status: 429 })
    }

    const { data: cvRow } = await supabase
      .from('cvs')
      .select('raw_text')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()
    if (!cvRow?.raw_text) {
      return NextResponse.json({ error: 'No primary CV found. Please upload your CV first.' }, { status: 400 })
    }

    const result = await analyseReadiness(
      cvRow.raw_text,
      body.targetJobTitle.trim(),
      body.targetSeniority?.trim() || null,
      body.targetGeography?.trim() || null,
      body.linkedinText?.trim() || null,
      (body.portfolioLinks ?? []).filter(Boolean)
    )

    const analysis = await saveReadinessAnalysis(
      supabase,
      user.id,
      {
        target_job_title: body.targetJobTitle.trim(),
        target_seniority: body.targetSeniority?.trim() || null,
        target_geography: body.targetGeography?.trim() || null,
        linkedin_text: body.linkedinText?.trim() || null,
        portfolio_links: (body.portfolioLinks ?? []).filter(Boolean),
      },
      result
    )

    return NextResponse.json({ analysis, remaining })
  } catch (err) {
    console.error('readiness analysis error', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
