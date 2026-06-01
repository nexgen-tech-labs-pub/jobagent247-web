import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserPlan } from '@/lib/db/users'
import { checkRateLimit } from '@/lib/rate-limit'
import { getJobById, upsertUserJobScore } from '@/lib/db/jobs'
import { scoreJobMatch } from '@/lib/claude'
import { classifyRole, getRoleProfile } from '@/lib/db/role-profiles'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { cvId: string; jobId: string }
  if (!body.cvId || !body.jobId) {
    return NextResponse.json({ error: 'cvId and jobId are required' }, { status: 400 })
  }

  try {
    const plan = await getUserPlan(supabase, user.id)
    const { allowed, remaining } = await checkRateLimit(user.id, plan)
    if (!allowed) {
      return NextResponse.json({ error: 'Daily limit reached. Upgrade for more.', remaining: 0 }, { status: 429 })
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

    const job = await getJobById(supabase, body.jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    let roleContext: string | undefined
    try {
      const { domain, seniority } = await classifyRole(job.title, job.description ?? '')
      const profile = await getRoleProfile(supabase, domain, seniority)
      if (profile) {
        roleContext = `Expected tech stack for this role: ${profile.tech_stack.join(', ')}\nKnown gaps to check for: ${profile.learning_focus.join(', ')}`
      }
    } catch { /* degrade gracefully */ }

    const result = await scoreJobMatch(cv.raw_text, job.description ?? '', job.title, roleContext)
    await upsertUserJobScore(supabase, user.id, body.jobId, result.score)

    return NextResponse.json({ ...result, remaining })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
