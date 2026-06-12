import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { analyseApplicationInsights } from '@/lib/claude'
import type { ApplicationStatus, UserJobWithJob } from '@/lib/types/database'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data: userJobs } = await supabase
      .from('user_jobs')
      .select('*, job:jobs(id, title, company)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const jobs = (userJobs ?? []) as UserJobWithJob[]

    if (jobs.length < 3) {
      return NextResponse.json({ error: 'Add at least 3 applications to unlock insights.' }, { status: 400 })
    }

    const { data: fitRows } = await supabase
      .from('job_fit_analyses')
      .select('saved_job_id, fit_score, match_category, missing_skills')
      .eq('user_id', user.id)

    const fitByJobId = new Map((fitRows ?? []).map(r => [r.saved_job_id as string, r]))

    const dataPoints = jobs.map(uj => ({
      jobTitle: uj.job?.title ?? 'Unknown',
      company: uj.job?.company ?? null,
      matchScore: uj.match_score,
      status: uj.status,
      missingSkills: (fitByJobId.get(uj.job_id)?.missing_skills ?? []) as string[],
      fitScore: fitByJobId.get(uj.job_id)?.fit_score ?? null,
      matchCategory: fitByJobId.get(uj.job_id)?.match_category ?? null,
    }))

    const outcomeBreakdown = jobs.reduce((acc, j) => {
      acc[j.status] = (acc[j.status] ?? 0) + 1
      return acc
    }, {} as Partial<Record<ApplicationStatus, number>>)

    const byOutcome = jobs.reduce((acc, j) => {
      if (j.match_score != null) {
        if (!acc[j.status]) acc[j.status] = { sum: 0, count: 0 }
        acc[j.status]!.sum += j.match_score
        acc[j.status]!.count += 1
      }
      return acc
    }, {} as Partial<Record<ApplicationStatus, { sum: number; count: number }>>)

    const avgMatchScoreByOutcome = Object.fromEntries(
      Object.entries(byOutcome).map(([k, v]) => [k, v ? Math.round(v.sum / v.count) : 0])
    ) as Partial<Record<ApplicationStatus, number>>

    const insights = await analyseApplicationInsights(
      dataPoints,
      jobs.length,
      outcomeBreakdown,
      avgMatchScoreByOutcome,
    )

    return NextResponse.json({ insights })
  } catch {
    return NextResponse.json({ error: 'Failed to generate insights. Please try again.' }, { status: 500 })
  }
}
