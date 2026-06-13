import { NextRequest, NextResponse, after } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase'
import { getJobById } from '@/lib/db/jobs'
import { insertDocument } from '@/lib/db/documents'
import { generateCoverLetter, generateRecruiterMessage, streamCVImprovement } from '@/lib/claude'

const logger = console  // swap for Sentry logger in Phase 5

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = (userData?.plan ?? 'free') as string

  if (plan === 'free') {
    const { count } = await supabase
      .from('user_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: 'Free plan is limited to 5 tracked jobs. Upgrade to Pro for unlimited tracking.', code: 'PLAN_LIMIT' },
        { status: 403 },
      )
    }
  }

  const body = await req.json() as {
    jobId: string
    matchScore: number
    wantCv: boolean
    wantCoverLetter: boolean
    wantRecruiterMessage: boolean
  }

  if (!body.jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
  }

  const score = Number(body.matchScore)
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return NextResponse.json({ error: 'matchScore must be a number between 0 and 100' }, { status: 400 })
  }

  // Get primary CV
  const { data: cvRow } = await supabase
    .from('cvs')
    .select('raw_text')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()
  if (!cvRow?.raw_text) {
    return NextResponse.json(
      { error: 'Upload a primary CV first' },
      { status: 400 }
    )
  }

  // Get job details
  const job = await getJobById(supabase, body.jobId)
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Insert user_jobs row
  const { data: userJobRow, error: ujError } = await supabase
    .from('user_jobs')
    .upsert(
      {
        user_id: user.id,
        job_id: body.jobId,
        status: 'saved',
        match_score: Math.round(score),
      },
      { onConflict: 'user_id,job_id' }
    )
    .select('id')
    .single()

  if (ujError || !userJobRow) {
    logger.error('[jobs/pipeline] user_jobs upsert failed:', ujError)
    return NextResponse.json({ error: 'Failed to add to pipeline' }, { status: 500 })
  }

  const userJobId = userJobRow.id
  const cvText = cvRow.raw_text
  const jobTitle = job.title
  const company = job.company ?? ''
  const jobDescription = job.description ?? job.title

  // Fire document generation after response is sent
  const needsDocGen = body.wantCv || body.wantCoverLetter || body.wantRecruiterMessage
  const adminDb = needsDocGen ? createAdminClient() : null
  const jobId = body.jobId

  if (adminDb && body.wantCoverLetter) {
    after(async () => {
      try {
        const chunks: string[] = []
        for await (const chunk of generateCoverLetter(cvText, jobDescription, jobTitle, company)) {
          chunks.push(chunk)
        }
        await insertDocument(adminDb, {
          user_id: user.id,
          job_id: jobId,
          type: 'cover_letter',
          content: chunks.join(''),
          file_url: null,
          ats_score: null,
        })
      } catch {
        // silently skip — user can regenerate from applications board
      }
    })
  }

  if (adminDb && body.wantRecruiterMessage) {
    after(async () => {
      try {
        const msg = await generateRecruiterMessage(cvText, jobDescription, jobTitle, company)
        await insertDocument(adminDb, {
          user_id: user.id,
          job_id: jobId,
          type: 'recruiter_msg',
          content: msg,
          file_url: null,
          ats_score: null,
        })
      } catch {
        // silently skip
      }
    })
  }

  if (adminDb && body.wantCv) {
    after(async () => {
      try {
        const chunks: string[] = []
        for await (const chunk of streamCVImprovement(cvText, jobDescription, jobTitle)) {
          chunks.push(chunk)
        }
        await insertDocument(adminDb, {
          user_id: user.id,
          job_id: jobId,
          type: 'tailored_cv',
          content: chunks.join(''),
          file_url: null,
          ats_score: null,
        })
      } catch {
        // silently skip
      }
    })
  }

  return NextResponse.json({ userJobId, message: 'Added to pipeline' })
}
