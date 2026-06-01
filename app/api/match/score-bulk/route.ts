import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserPlan } from '@/lib/db/users'
import { checkRateLimit } from '@/lib/rate-limit'
import { upsertUserJobScore } from '@/lib/db/jobs'
import { scoreJobMatch } from '@/lib/claude'
import { classifyRole, getRoleProfile } from '@/lib/db/role-profiles'
import type { Job } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { cvId: string; jobIds: string[] }
  if (!body.cvId || !Array.isArray(body.jobIds)) {
    return NextResponse.json({ error: 'cvId and jobIds are required' }, { status: 400 })
  }
  if (body.jobIds.length > 10) {
    return NextResponse.json({ error: 'Maximum 10 jobs per bulk request' }, { status: 400 })
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

    const { data: jobRows } = await supabase
      .from('jobs')
      .select('*')
      .in('id', body.jobIds)
    const jobs = (jobRows ?? []) as Job[]

    const results = await Promise.all(
      jobs.map(async (job) => {
        let roleContext: string | undefined
        try {
          const { domain, seniority } = await classifyRole(job.title, job.description ?? '')
          const profile = await getRoleProfile(supabase, domain, seniority)
          if (profile) {
            roleContext = `Expected tech stack for this role: ${profile.tech_stack.join(', ')}\nKnown gaps to check for: ${profile.learning_focus.join(', ')}`
          }
        } catch { /* degrade gracefully */ }
        const result = await scoreJobMatch(cv.raw_text!, job.description ?? '', job.title, roleContext)
        return { jobId: job.id, ...result }
      })
    )

    await Promise.all(
      results.map((r) => upsertUserJobScore(supabase, user.id, r.jobId, r.score))
    )

    return NextResponse.json(results.map(({ jobId, score, verdict }) => ({ jobId, score, verdict })))
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
