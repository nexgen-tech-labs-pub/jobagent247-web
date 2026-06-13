import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('connected_email_accounts')
    .select('id, provider, email_address, connection_status, last_successful_sync_at, last_sync_attempt_at, initial_sync_completed, required_container_name, provider_container_id')
    .eq('user_id', user.id)
    .neq('connection_status', 'disconnected')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ accounts: data ?? [] })
}
