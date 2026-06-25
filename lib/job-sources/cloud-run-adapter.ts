import { randomUUID } from 'crypto'
import { triggerScrapingJob } from '@/lib/scraper'
import { createServerClient } from '@/lib/supabase'
import type { JobSourceAdapter, JobSearchRequest, JobSearchRun, PollResult } from './types'
import { UK_SCRAPER_SITES, INDIA_SCRAPER_SITES } from './sites'

const UK_SITES = UK_SCRAPER_SITES
const INDIA_SITES = INDIA_SCRAPER_SITES

async function pollCloudRunJob(runId: string): Promise<PollResult> {
  const scrapeJobId = runId.replace(/^cloudrun::/, '')
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('scrape_jobs')
    .select('status, results_count')
    .eq('id', scrapeJobId)
    .single()

  if (!data) return { status: 'failed' }
  if (data.status === 'queued' || data.status === 'running') return { status: 'running' }
  if (data.status === 'failed') return { status: 'failed' }
  return { status: 'done', jobsAdded: data.results_count ?? 0 }
}

export const CloudRunUKAdapter: JobSourceAdapter = {
  async search(req: JobSearchRequest): Promise<JobSearchRun[]> {
    const scrapeJobId = randomUUID()
    await triggerScrapingJob({
      scrape_job_id: scrapeJobId,
      user_id: req.userId,
      keywords: req.targetRole.split(' '),
      location: req.location,
      locale: 'uk',
      job_type: req.remoteOnly ? 'remote' : '',
      visa_required: false,
      sites: [...UK_SITES],
    })
    return [{ runId: `cloudrun::${scrapeJobId}`, source: 'UK Job Boards' }]
  },

  poll: (runId) => pollCloudRunJob(runId),
}

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
      sites: [...INDIA_SITES],
    })
    return [{ runId: `cloudrun::${scrapeJobId}`, source: 'India Job Boards' }]
  },

  poll: (runId) => pollCloudRunJob(runId),
}
