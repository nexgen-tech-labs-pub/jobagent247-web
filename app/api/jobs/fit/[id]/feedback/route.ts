import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { upsertFeedback } from '@/lib/db/job-fit'
import type { UserFeedback, ApplicationOutcome } from '@/lib/types/database'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json() as {
    userFeedback?: UserFeedback
    applicationOutcome?: ApplicationOutcome
    notes?: string
  }

  const feedback = await upsertFeedback(
    supabase,
    user.id,
    id,
    body.userFeedback ?? null,
    body.applicationOutcome ?? null,
    body.notes ?? null
  )

  return NextResponse.json(feedback)
}
