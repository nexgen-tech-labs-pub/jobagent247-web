import {
  triggerApifyRun,
  getApifyRun,
  fetchApifyDataset,
  normaliseApifyJob,
} from '@/lib/apify'
import { upsertApifyJob } from '@/lib/db/jobs'
import { createServerClient } from '@/lib/supabase'
import type { JobSourceAdapter, JobSearchRequest, JobSearchRun, PollResult } from './types'

const APIFY_ACTOR_LINKEDIN = process.env.APIFY_ACTOR_LINKEDIN ?? 'bebity/linkedin-jobs-scraper'
const APIFY_ACTOR_INDEED   = process.env.APIFY_ACTOR_INDEED   ?? 'misceres/indeed-scraper'
const APIFY_ACTOR_NAUKRI   = process.env.APIFY_ACTOR_NAUKRI   ?? 'curious_coder/naukri-scraper'

export const ApifyUKAdapter: JobSourceAdapter = {
  async search(req: JobSearchRequest): Promise<JobSearchRun[]> {
    const linkedinInput = {
      keywords: req.targetRole,
      location: req.location,
      remote: req.remoteOnly,
      maxResults: 25,
    }
    const indeedInput = {
      position: req.targetRole,
      country: 'UK',
      location: req.location,
      maxItems: 25,
    }

    const [linkedinRunId, indeedRunId] = await Promise.all([
      triggerApifyRun(APIFY_ACTOR_LINKEDIN, linkedinInput),
      triggerApifyRun(APIFY_ACTOR_INDEED, indeedInput),
    ])

    return [
      { runId: `apify::${linkedinRunId}`, source: 'LinkedIn' },
      { runId: `apify::${indeedRunId}`, source: 'Indeed' },
    ]
  },

  async poll(runId: string, source: string): Promise<PollResult> {
    const apifyRunId = runId.replace(/^apify::/, '')
    const run = await getApifyRun(apifyRunId)

    if (run.status === 'RUNNING' || run.status === 'READY') {
      return { status: 'running' }
    }
    if (
      run.status === 'FAILED' ||
      run.status === 'ABORTED' ||
      run.status === 'TIMED-OUT' ||
      run.status === 'TIMING-OUT'
    ) {
      return { status: 'failed' }
    }
    if (run.status === 'SUCCEEDED') {
      const items = await fetchApifyDataset(run.defaultDatasetId)
      const supabase = await createServerClient()
      let jobsAdded = 0
      for (const item of items) {
        const job = normaliseApifyJob(item, source, apifyRunId)
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

export const ApifyIndiaAdapter: JobSourceAdapter = {
  async search(req: JobSearchRequest): Promise<JobSearchRun[]> {
    const naukriInput = {
      keywords: req.targetRole,
      location: req.location,
      maxResults: 25,
    }
    const indeedInput = {
      position: req.targetRole,
      country: 'IN',
      location: req.location,
      maxItems: 25,
    }

    const [naukriRunId, indeedRunId] = await Promise.all([
      triggerApifyRun(APIFY_ACTOR_NAUKRI, naukriInput),
      triggerApifyRun(APIFY_ACTOR_INDEED, indeedInput),
    ])

    return [
      { runId: `apify::${naukriRunId}`, source: 'Naukri' },
      { runId: `apify::${indeedRunId}`, source: 'Indeed India' },
    ]
  },

  poll: ApifyUKAdapter.poll,
}
