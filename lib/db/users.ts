import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '../types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export async function getUser(db: Client, userId: string): Promise<User | null> {
  const { data } = await db
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return data as User | null
}

// Called on first sign-in to create the users row (id = auth.uid())
export async function upsertUser(
  db: Client,
  payload: Omit<User, 'created_at'>
): Promise<User> {
  const { data, error } = await db
    .from('users')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data as User
}

export async function updateUser(
  db: Client,
  userId: string,
  updates: Partial<Omit<User, 'id' | 'created_at'>>
): Promise<User> {
  const { data, error } = await db
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data as User
}

export async function getUserPlan(
  db: Client,
  userId: string
): Promise<'free' | 'pro' | 'accelerator'> {
  const { data } = await db
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single()
  return (data?.plan ?? 'free') as 'free' | 'pro' | 'accelerator'
}
