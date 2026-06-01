import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserPlan } from '@/lib/db/users'
import { checkRateLimit } from '@/lib/rate-limit'
import { analyseCVForRole } from '@/lib/claude'
import { classifyRole, getRoleProfile } from '@/lib/db/role-profiles'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    cvId: string
    jobDescription: string
    targetRole?: string
  }

  if (!body.cvId || !body.jobDescription) {
    return NextResponse.json({ error: 'cvId and jobDescription are required' }, { status: 400 })
  }

  const plan = await getUserPlan(supabase, user.id)
  const { allowed, remaining } = await checkRateLimit(user.id, plan)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Daily application limit reached. Upgrade your plan for more.', remaining: 0 },
      { status: 429 }
    )
  }

  const { data: cv } = await supabase
    .from('cvs')
    .select('raw_text')
    .eq('id', body.cvId)
    .eq('user_id', user.id)
    .single()

  if (!cv?.raw_text) {
    return NextResponse.json({ error: 'CV not found or has no text' }, { status: 404 })
  }

  let roleContext: string | undefined
  try {
    const { domain, seniority } = await classifyRole(body.targetRole ?? body.jobDescription.slice(0, 120), body.jobDescription)
    const profile = await getRoleProfile(supabase, domain, seniority)
    if (profile) {
      roleContext = `Role knowledge base for ${profile.role_title}:\nKey tech stack: ${profile.tech_stack.join(', ')}\nCritical ATS keywords to include: ${profile.tech_stack.join(', ')}\nSkills gap focus areas: ${profile.learning_focus.join(', ')}`
    }
  } catch { /* degrade gracefully — agents work fine without role context */ }

  const result = await analyseCVForRole(
    cv.raw_text,
    body.jobDescription,
    body.targetRole ?? '',
    roleContext
  )

  await supabase
    .from('cvs')
    .update({ ats_score: result.score })
    .eq('id', body.cvId)
    .eq('user_id', user.id)

  return NextResponse.json({ ...result, remaining })
}
