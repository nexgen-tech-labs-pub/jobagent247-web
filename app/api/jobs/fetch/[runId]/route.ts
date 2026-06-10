import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { pollJobRun } from '@/lib/job-sources'

const logger = console  // swap for Sentry logger in Phase 5

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { runId } = await params
  const source = req.nextUrl.searchParams.get('source') ?? 'Unknown'

  try {
    const result = await pollJobRun(runId, source)
    return NextResponse.json(result)
  } catch (err) {
    logger.error('[jobs/fetch/[runId]] error:', err)
    return NextResponse.json({ status: 'failed' })
  }
}
