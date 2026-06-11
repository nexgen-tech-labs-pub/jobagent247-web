import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserBillingContext, getUser } from '@/lib/db/users'
import { checkQuota } from '@/lib/rate-limit'
import { analyseJobFit } from '@/lib/claude'
import { saveJobWithAnalysis } from '@/lib/db/job-fit'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    jobTitle: string
    jobDescription: string
    companyName?: string
    jobUrl?: string
    location?: string
    salaryRange?: string
    workMode?: string
    employmentType?: string
  }

  if (!body.jobTitle?.trim() || !body.jobDescription?.trim()) {
    return NextResponse.json({ error: 'jobTitle and jobDescription are required' }, { status: 400 })
  }

  try {
    const { plan, locale } = await getUserBillingContext(supabase, user.id)
    const { allowed, remaining } = await checkQuota(supabase, user.id, plan, 'job_fit', locale)
    if (!allowed) {
      return NextResponse.json({ error: 'Free plan allows 2 job fit analyses. Upgrade for more.', remaining: 0 }, { status: 429 })
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

    const profile = await getUser(supabase, user.id)
    const result = await analyseJobFit(
      cvRow.raw_text,
      body.jobDescription,
      body.jobTitle,
      profile ? {
        location: profile.location_pref,
        visa_required: profile.visa_required,
        job_type_pref: profile.job_type_pref,
      } : undefined
    )

    const { savedJob, analysis } = await saveJobWithAnalysis(
      supabase,
      user.id,
      {
        job_title: body.jobTitle,
        company_name: body.companyName ?? null,
        job_url: body.jobUrl ?? null,
        job_description: body.jobDescription,
        location: body.location ?? null,
        salary_range: body.salaryRange ?? null,
        work_mode: body.workMode ?? null,
        employment_type: body.employmentType ?? null,
        source: null,
      },
      result
    )

    return NextResponse.json({ analysis: result, savedJob, remaining })
  } catch (err) {
    console.error('job fit error', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
