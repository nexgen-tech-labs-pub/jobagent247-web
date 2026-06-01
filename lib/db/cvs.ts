import type { SupabaseClient } from '@supabase/supabase-js'
import type { CV } from '../types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export async function getCVsByUser(db: Client, userId: string): Promise<CV[]> {
  const { data, error } = await db
    .from('cvs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as CV[]
}

export async function getPrimaryCV(db: Client, userId: string): Promise<CV | null> {
  const { data } = await db
    .from('cvs')
    .select('*')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .single()
  return data as CV | null
}

export async function insertCV(
  db: Client,
  payload: Omit<CV, 'id' | 'created_at'>
): Promise<CV> {
  const { data, error } = await db
    .from('cvs')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as CV
}

export async function setPrimaryCV(db: Client, cvId: string, userId: string): Promise<void> {
  await db.from('cvs').update({ is_primary: false }).eq('user_id', userId)
  const { error } = await db
    .from('cvs')
    .update({ is_primary: true })
    .eq('id', cvId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function deleteCV(db: Client, cvId: string, userId: string): Promise<void> {
  const { error } = await db
    .from('cvs')
    .delete()
    .eq('id', cvId)
    .eq('user_id', userId)
  if (error) throw error
}
