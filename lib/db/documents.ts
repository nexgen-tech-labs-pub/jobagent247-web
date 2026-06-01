import type { SupabaseClient } from '@supabase/supabase-js'
import type { Document } from '../types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export async function getDocumentsByUser(db: Client, userId: string): Promise<Document[]> {
  const { data, error } = await db
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Document[]
}

export async function getDocumentsByJob(
  db: Client,
  userId: string,
  jobId: string
): Promise<Document[]> {
  const { data, error } = await db
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Document[]
}

export async function insertDocument(
  db: Client,
  payload: Omit<Document, 'id' | 'created_at'>
): Promise<Document> {
  const { data, error } = await db
    .from('documents')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as Document
}

export async function updateDocumentFileUrl(
  db: Client,
  documentId: string,
  userId: string,
  fileUrl: string
): Promise<void> {
  const { error } = await db
    .from('documents')
    .update({ file_url: fileUrl })
    .eq('id', documentId)
    .eq('user_id', userId)
  if (error) throw error
}
