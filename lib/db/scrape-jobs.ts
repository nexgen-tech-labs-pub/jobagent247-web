import type { SupabaseClient } from '@supabase/supabase-js'
import type { ScrapeJob } from '../types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export async function createScrapeJob(
  db: Client,
  payload: Omit<ScrapeJob, 'id' | 'created_at' | 'completed_at' | 'results_count' | 'error'>
): Promise<ScrapeJob> {
  const { data, error } = await db
    .from('scrape_jobs')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as ScrapeJob
}

export async function getScrapeJob(db: Client, id: string): Promise<ScrapeJob | null> {
  const { data } = await db
    .from('scrape_jobs')
    .select('*')
    .eq('id', id)
    .single()
  return data as ScrapeJob | null
}

export async function updateScrapeJobStatus(
  db: Client,
  id: string,
  status: ScrapeJob['status'],
  extra?: { results_count?: number; error?: string; completed_at?: string }
): Promise<void> {
  const { error } = await db
    .from('scrape_jobs')
    .update({ status, ...extra })
    .eq('id', id)
  if (error) throw error
}
