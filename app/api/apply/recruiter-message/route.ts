import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserPlan } from '@/lib/db/users'
import { checkRateLimit } from '@/lib/rate-limit'
import { insertDocument } from '@/lib/db/documents'
import { generateRecruiterMessage } from '@/lib/claude'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    cvId: string
    jobDescription: string
    jobTitle: string
    company?: string
    jobId?: string
  }

  if (!body.cvId || !body.jobDescription || !body.jobTitle) {
    return NextResponse.json({ error: 'cvId, jobDescription and jobTitle are required' }, { status: 400 })
  }

  try {
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

    const message = await generateRecruiterMessage(
      cv.raw_text,
      body.jobDescription,
      body.jobTitle,
      body.company ?? ''
    )

    await insertDocument(supabase, {
      user_id: user.id,
      job_id: body.jobId ?? null,
      type: 'recruiter_msg',
      content: message,
      file_url: null,
      ats_score: null,
    })

    return NextResponse.json({ message, remaining })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
