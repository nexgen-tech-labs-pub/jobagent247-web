export interface ScrapeJobPayload {
  scrape_job_id: string
  user_id: string
  keywords: string[]
  location: string
  job_type: string
  visa_required: boolean
  sites: string[]
}

export async function triggerScrapingJob(payload: ScrapeJobPayload): Promise<void> {
  const url = `${process.env.GCP_CLOUD_RUN_URL}/scrape`
  const token = process.env.CLOUD_TASKS_HANDLER_TOKEN

  if (!url || !token) throw new Error('GCP_CLOUD_RUN_URL or CLOUD_TASKS_HANDLER_TOKEN not set')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Scraper returned ${res.status}: ${text.slice(0, 200)}`)
  }
}
