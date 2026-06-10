import { randomUUID } from 'crypto'
import { triggerScrapingJob } from '@/lib/scraper'
import { createServerClient } from '@/lib/supabase'
import { normaliseApifyJob } from '@/lib/apify'
import { upsertApifyJob } from '@/lib/db/jobs'
import type { JobSourceAdapter, JobSearchRequest, JobSearchRun, PollResult } from './types'

const CLOUD_RUN_STATUS_URL = process.env.GCP_CLOUD_RUN_URL

// India sites available via Cloud Run Scrapling
const INDIA_SITES = ['naukri.com', 'shine.com', 'timesjobs.com', 'foundit.in']

export const CloudRunIndiaAdapter: JobSourceAdapter = {
  async search(req: JobSearchRequest): Promise<JobSearchRun[]> {
    const scrapeJobId = randomUUID()
    await triggerScrapingJob({
      scrape_job_id: scrapeJobId,
      user_id: req.userId,
      keywords: req.targetRole.split(' '),
      location: req.location,
      locale: 'in',
      job_type: req.remoteOnly ? 'remote' : '',
      visa_required: false,
      sites: INDIA_SITES,
    })
    return [{ runId: `cloudrun::${scrapeJobId}`, source: 'India Job Boards' }]
  },

  async poll(runId: string, _source: string): Promise<PollResult> {
    const scrapeJobId = runId.replace(/^cloudrun::/, '')

    if (!CLOUD_RUN_STATUS_URL) {
      return { status: 'failed' }
    }

    const token = process.env.CLOUD_TASKS_HANDLER_TOKEN
    const res = await fetch(
      `${CLOUD_RUN_STATUS_URL}/status/${scrapeJobId}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )

    if (!res.ok) return { status: 'failed' }

    const data = await res.json() as {
      status: string
      jobs?: Record<string, unknown>[]
    }

    if (data.status === 'running' || data.status === 'queued') {
      return { status: 'running' }
    }
    if (data.status === 'failed') {
      return { status: 'failed' }
    }
    if (data.status === 'done' && Array.isArray(data.jobs)) {
      const supabase = await createServerClient()
      let jobsAdded = 0
      for (const item of data.jobs) {
        const job = normaliseApifyJob(item, 'India Job Boards', scrapeJobId)
        if (!job) continue
        try {
          await upsertApifyJob(supabase, job)
          jobsAdded++
        } catch { /* skip individual failures */ }
      }
      return { status: 'done', jobsAdded }
    }
    return { status: 'running' }
  },
}
