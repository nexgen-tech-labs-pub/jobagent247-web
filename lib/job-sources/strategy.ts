import type { JobSourceAdapter, JobSearchRequest, JobSearchRun, PollResult } from './types'
import { ApifyUKAdapter, ApifyIndiaAdapter } from './apify-adapter'
import { CloudRunIndiaAdapter } from './cloud-run-adapter'

function cloudRunAvailable(): boolean {
  return !!(process.env.GCP_CLOUD_RUN_URL && process.env.CLOUD_TASKS_HANDLER_TOKEN)
}

function getPrimaryAdapter(locale: 'uk' | 'in'): JobSourceAdapter {
  if (locale === 'in' && cloudRunAvailable()) return CloudRunIndiaAdapter
  if (locale === 'in') return ApifyIndiaAdapter
  return ApifyUKAdapter
}

function getFallbackAdapter(locale: 'uk' | 'in'): JobSourceAdapter | null {
  // India + Cloud Run → fallback to Apify India
  if (locale === 'in' && cloudRunAvailable()) return ApifyIndiaAdapter
  return null
}

export async function runJobSearch(req: JobSearchRequest): Promise<JobSearchRun[]> {
  const primary = getPrimaryAdapter(req.locale)

  try {
    return await primary.search(req)
  } catch (err) {
    const fallback = getFallbackAdapter(req.locale)
    if (!fallback) throw err

    console.warn(
      `[job-sources] primary adapter failed for locale=${req.locale}, trying fallback:`,
      err instanceof Error ? err.message : err
    )

    return fallback.search(req)
  }
}

export function resolveRunAdapter(runId: string): JobSourceAdapter {
  if (runId.startsWith('cloudrun::')) return CloudRunIndiaAdapter
  return ApifyUKAdapter  // handles both apify:: prefix and legacy un-prefixed IDs
}

export async function pollJobRun(runId: string, source: string): Promise<PollResult> {
  const adapter = resolveRunAdapter(runId)
  return adapter.poll(runId, source)
}
