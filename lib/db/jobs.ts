import type { SupabaseClient } from '@supabase/supabase-js'
import type { Job, JobType, UserJobWithJob, ApplicationStatus } from '../types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export interface JobSearchParams {
  keywords?: string
  location?: string
  type?: JobType | ''
  visa?: boolean
  page?: number
  limit?: number
}

export async function searchJobs(
  db: Client,
  userId: string,
  params: JobSearchParams
): Promise<{ jobs: UserJobWithJob[]; total: number }> {
  const { keywords = '', location = '', type = '', visa = false, page = 1, limit = 20 } = params
  const offset = (page - 1) * limit

  let query = db
    .from('user_jobs')
    .select('*, job:jobs(*)', { count: 'exact' })
    .eq('user_id', userId)
    .order('match_score', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (keywords) {
    query = query.or(`title.ilike.%${keywords}%,description.ilike.%${keywords}%`, {
      referencedTable: 'jobs',
    })
  }
  if (location) {
    query = query.ilike('jobs.location', `%${location}%`)
  }
  if (type) {
    query = query.eq('jobs.type', type)
  }
  if (visa) {
    query = query.eq('jobs.visa_sponsorship', true)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { jobs: data as UserJobWithJob[], total: count ?? 0 }
}

export async function saveJob(db: Client, userId: string, jobId: string): Promise<void> {
  const { error } = await db
    .from('user_jobs')
    .upsert({ user_id: userId, job_id: jobId, status: 'saved' }, { onConflict: 'user_id,job_id' })
  if (error) throw error
}

export async function updateJobStatus(
  db: Client,
  userId: string,
  jobId: string,
  status: ApplicationStatus,
  extra?: { notes?: string; applied_at?: string; follow_up_date?: string }
): Promise<void> {
  const { error } = await db
    .from('user_jobs')
    .update({ status, ...extra })
    .eq('user_id', userId)
    .eq('job_id', jobId)
  if (error) throw error
}

export async function updateMatchScore(
  db: Client,
  userId: string,
  jobId: string,
  matchScore: number
): Promise<void> {
  const { error } = await db
    .from('user_jobs')
    .update({ match_score: matchScore })
    .eq('user_id', userId)
    .eq('job_id', jobId)
  if (error) throw error
}

export async function getUserJobsByStatus(
  db: Client,
  userId: string,
  status: ApplicationStatus
): Promise<UserJobWithJob[]> {
  const { data, error } = await db
    .from('user_jobs')
    .select('*, job:jobs(*)')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as UserJobWithJob[]
}

export async function getJobById(db: Client, jobId: string): Promise<Job | null> {
  const { data, error } = await db
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data as Job | null
}

export async function upsertUserJobScore(
  db: Client,
  userId: string,
  jobId: string,
  matchScore: number
): Promise<void> {
  const { error } = await db
    .from('user_jobs')
    .upsert(
      { user_id: userId, job_id: jobId, match_score: matchScore, status: 'saved' },
      { onConflict: 'user_id,job_id' }
    )
  if (error) throw error
}
