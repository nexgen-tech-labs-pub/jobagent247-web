import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getApifyRun, fetchApifyDataset, normaliseApifyJob } from '@/lib/apify'
import { upsertApifyJob } from '@/lib/db/jobs'

const logger = console  // swap for Sentry logger in Phase 5

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { runId } = await params
  const sourceSite = req.nextUrl.searchParams.get('source') ?? 'Apify'

  try {
    const run = await getApifyRun(runId)

    if (run.status === 'RUNNING' || run.status === 'READY') {
      return NextResponse.json({ status: 'running' })
    }

    if (
      run.status === 'FAILED' ||
      run.status === 'ABORTED' ||
      run.status === 'TIMED-OUT' ||
      run.status === 'TIMING-OUT'
    ) {
      return NextResponse.json({ status: 'failed' })
    }

    if (run.status === 'SUCCEEDED') {
      const items = await fetchApifyDataset(run.defaultDatasetId)

      let jobsAdded = 0
      for (const item of items) {
        const job = normaliseApifyJob(item, sourceSite, runId)
        if (!job) continue
        try {
          await upsertApifyJob(supabase, job)
          jobsAdded++
        } catch {
          // skip individual failures — continue with rest of dataset
        }
      }

      return NextResponse.json({ status: 'done', jobsAdded })
    }

    return NextResponse.json({ status: 'running' })
  } catch (err) {
    logger.error('[jobs/fetch/[runId]] error:', err)
    return NextResponse.json({ status: 'failed' })
  }
}
