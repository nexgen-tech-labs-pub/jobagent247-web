import type { Job, JobType } from './types/database'

const BASE = 'https://api.apify.com/v2'

function token(): string {
  const t = process.env.APIFY_API_TOKEN
  if (!t) throw new Error('APIFY_API_TOKEN is not set')
  return t
}

export interface ApifyRunResult {
  id: string
  status: 'RUNNING' | 'READY' | 'SUCCEEDED' | 'FAILED' | 'ABORTED' | 'TIMING-OUT' | 'TIMED-OUT'
  defaultDatasetId: string
}

export async function triggerApifyRun(
  actorId: string,
  input: Record<string, unknown>
): Promise<string> {
  const res = await fetch(
    `${BASE}/acts/${encodeURIComponent(actorId)}/runs`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify(input),
    }
  )
  if (!res.ok) {
    let errorType = 'apify-error'
    let errorMessage = `Apify trigger failed (${res.status})`
    try {
      const body = await res.json() as { error?: { type?: string; message?: string } }
      errorType = body.error?.type ?? errorType
      errorMessage = body.error?.message ?? errorMessage
    } catch { /* non-JSON body */ }
    const err = new Error(errorMessage)
    ;(err as Error & { apifyType: string }).apifyType = errorType
    throw err
  }
  const json = await res.json() as { data: ApifyRunResult }
  return json.data.id
}

export async function getApifyRun(runId: string): Promise<ApifyRunResult> {
  const res = await fetch(`${BASE}/actor-runs/${runId}`, {
    headers: { Authorization: `Bearer ${token()}` },
  })
  if (!res.ok) throw new Error(`Apify run fetch failed (${res.status})`)
  const json = await res.json() as { data: ApifyRunResult }
  return json.data
}

export async function fetchApifyDataset(datasetId: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(
    `${BASE}/datasets/${datasetId}/items?limit=50&clean=true`,
    {
      headers: { Authorization: `Bearer ${token()}` },
    }
  )
  if (!res.ok) throw new Error(`Apify dataset fetch failed (${res.status})`)
  return res.json() as Promise<Record<string, unknown>[]>
}

function str(v: unknown): string | null {
  if (typeof v === 'string' && v.trim()) return v.trim()
  return null
}

function num(v: unknown): number | null {
  const n = Number(v)
  return isFinite(n) && n >= 0 ? n : null
}

function jobType(v: unknown): JobType | null {
  const s = str(v)?.toLowerCase() ?? ''
  if (s.includes('contract') || s.includes('freelance')) return 'contract'
  if (s.includes('remote')) return 'remote'
  if (s.includes('permanent') || s.includes('full-time')) return 'permanent'
  return null
}

export function normaliseApifyJob(
  raw: Record<string, unknown>,
  sourceSite: string,
  apifyRunId: string
): (Partial<Omit<Job, 'id' | 'url' | 'title' | 'scraped_at'>> & { url: string; title: string; scraped_at: string }) | null {
  const url = str(raw.url) ?? str(raw.jobUrl) ?? str(raw.externalUrl) ?? str(raw.applyUrl)
  if (!url) return null

  const title = str(raw.title) ?? str(raw.position) ?? str(raw.jobTitle) ?? str(raw.name)
  if (!title) return null

  let salaryMin: number | null = null
  let salaryMax: number | null = null
  if (raw.salaryMin !== undefined || raw.salaryMax !== undefined) {
    salaryMin = num(raw.salaryMin)
    salaryMax = num(raw.salaryMax)
  } else if (typeof raw.salary === 'string') {
    const match = raw.salary.match(/[\d,]+/g)
    if (match && match.length >= 2) {
      salaryMin = num(match[0].replace(/,/g, ''))
      salaryMax = num(match[1].replace(/,/g, ''))
    } else if (match && match.length === 1) {
      salaryMin = num(match[0].replace(/,/g, ''))
    }
  }

  return {
    title,
    url,
    scraped_at: new Date().toISOString(),
    company: str(raw.company) ?? str(raw.companyName) ?? str(raw.employer) ?? null,
    location: str(raw.location) ?? str(raw.place) ?? null,
    type: jobType(raw.contractType ?? raw.jobType ?? raw.employmentType ?? raw.type),
    salary_min: salaryMin,
    salary_max: salaryMax,
    currency: (str(raw.currency) ?? 'GBP').toUpperCase(),
    description: str(raw.description) ?? str(raw.jobDescription) ?? str(raw.descriptionHtml) ?? null,
    source_site: sourceSite,
    visa_sponsorship: raw.visaSponsorship === true || raw.sponsorship === true,
    apify_run_id: apifyRunId,
  }
}
