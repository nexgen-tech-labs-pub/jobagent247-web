import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserPlan } from '@/lib/db/users'
import { checkRateLimit } from '@/lib/rate-limit'
import { generateInterviewQuestions } from '@/lib/claude'
import { classifyRole, getRoleProfile } from '@/lib/db/role-profiles'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) return NextResponse.json({ error: 'Auth error' }, { status: 500 })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json() as {
      cvId: string
      jobId: string
      count?: number
    }

    if (!body.cvId || !body.jobId) {
      return NextResponse.json({ error: 'cvId and jobId are required' }, { status: 400 })
    }

    const rawCount = typeof body.count === 'number' && Number.isInteger(body.count) && body.count > 0
      ? body.count
      : 10
    const count = Math.min(rawCount, 20)

    const plan = await getUserPlan(supabase, user.id)
    const { allowed, remaining } = await checkRateLimit(user.id, plan)
    if (!allowed) {
      return NextResponse.json({ error: 'Daily limit reached.', remaining: 0 }, { status: 429 })
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

    const { data: job } = await supabase
      .from('jobs')
      .select('title, company, description')
      .eq('id', body.jobId)
      .single()
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    let interviewTopics: string[] | undefined
    try {
      const { domain, seniority } = await classifyRole(job.title, job.description ?? '')
      const profile = await getRoleProfile(supabase, domain, seniority)
      if (profile) interviewTopics = profile.interview_topics
    } catch { /* degrade gracefully */ }

    const questions = await generateInterviewQuestions(
      cv.raw_text,
      job.description ?? '',
      job.title,
      job.company ?? '',
      count,
      interviewTopics
    )

    const { error: insertError } = await supabase.from('interview_sessions').insert({
      user_id: user.id,
      job_id: body.jobId,
      questions,
    })
    if (insertError) {
      return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
    }

    return NextResponse.json({ questions, remaining })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
