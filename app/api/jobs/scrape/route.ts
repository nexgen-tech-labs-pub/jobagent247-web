import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { triggerScrapingJob } from '@/lib/scraper'

const logger = console  // swap for Sentry logger in Phase 5

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    keywords: string[]
    location: string
    job_type?: string
    visa_required?: boolean
    sites?: string[]
  }

  const { data: scrapeJob, error } = await supabase
    .from('scrape_jobs')
    .insert({
      user_id: user.id,
      search_criteria: {
        keywords: body.keywords,
        location: body.location,
        job_type: body.job_type ?? '',
        visa_required: body.visa_required ?? false,
      },
      status: 'queued',
      sites: body.sites ?? [],
    })
    .select()
    .single()

  if (error) {
    logger.error('[jobs/scrape] DB insert failed:', error.code, error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  try {
    await triggerScrapingJob({
      scrape_job_id: scrapeJob.id,
      user_id: user.id,
      keywords: body.keywords,
      location: body.location,
      job_type: body.job_type ?? '',
      visa_required: body.visa_required ?? false,
      sites: body.sites ?? [],
    })
    logger.log('[jobs/scrape] Triggered scrape job:', scrapeJob.id)
  } catch (err) {
    logger.error('[jobs/scrape] Scraper trigger failed:', err)
    await supabase
      .from('scrape_jobs')
      .update({ status: 'failed', error: String(err) })
      .eq('id', scrapeJob.id)

    return NextResponse.json({ error: String(err) }, { status: 500 })
  }

  return NextResponse.json({ scrape_job_id: scrapeJob.id }, { status: 202 })
}
