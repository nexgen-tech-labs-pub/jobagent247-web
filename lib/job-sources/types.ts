export interface JobSearchRequest {
  targetRole: string
  location: string
  remoteOnly: boolean
  locale: 'uk' | 'in'
  userId: string
}

export interface JobSearchRun {
  runId: string       // prefixed: "apify::<id>" | "cloudrun::<id>"
  source: string      // display name e.g. "LinkedIn", "Naukri"
}

export interface PollResult {
  status: 'running' | 'done' | 'failed'
  jobsAdded?: number
}

export interface JobSourceAdapter {
  /** Start a search and return run handles */
  search(req: JobSearchRequest): Promise<JobSearchRun[]>
  /** Poll a single run handle to completion */
  poll(runId: string, source: string): Promise<PollResult>
}
