import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserBillingContext } from '@/lib/db/users'
import { checkQuota } from '@/lib/rate-limit'
import { generateInterviewKit } from '@/lib/claude'
import { saveInterviewKit } from '@/lib/db/interview'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    jobDescription: string
    targetRole: string
    companyName?: string
    interviewType?: string
    geography?: string
  }

  if (!body.jobDescription?.trim() || !body.targetRole?.trim()) {
    return NextResponse.json({ error: 'jobDescription and targetRole are required' }, { status: 400 })
  }

  try {
    const { plan, locale } = await getUserBillingContext(supabase, user.id)
    const { allowed, remaining } = await checkQuota(supabase, user.id, plan, 'interview_kit', locale)
    if (!allowed) {
      return NextResponse.json({ error: 'Free plan allows 1 interview kit. Upgrade for more.', remaining: 0 }, { status: 429 })
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

    const result = await generateInterviewKit(
      cvRow.raw_text,
      body.jobDescription.trim(),
      body.targetRole.trim(),
      body.companyName?.trim() ?? '',
      body.interviewType ?? 'General',
      body.geography ?? 'UK'
    )

    const kit = await saveInterviewKit(supabase, user.id, {
      company_name: body.companyName?.trim() ?? null,
      job_description: body.jobDescription.trim(),
      target_role: body.targetRole.trim(),
      interview_type: body.interviewType ?? 'General',
      geography: body.geography ?? 'UK',
    }, result)

    return NextResponse.json({ kit, remaining })
  } catch {
    return NextResponse.json({ error: 'Kit generation failed. Please try again.' }, { status: 500 })
  }
}
