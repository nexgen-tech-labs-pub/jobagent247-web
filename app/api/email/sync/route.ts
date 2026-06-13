import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { syncAccount } from '@/lib/email/sync-engine'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: accounts } = await supabase
    .from('connected_email_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('connection_status', 'active')

  if (!accounts?.length) return NextResponse.json({ message: 'No active accounts to sync' })

  const results = await Promise.allSettled(
    accounts.map(a => syncAccount(supabase, a.id, 'manual'))
  )

  const summary = results.map((r, i) => ({
    accountId: accounts[i].id,
    status: r.status,
    result: r.status === 'fulfilled' ? r.value : { error: String(r.reason) },
  }))

  return NextResponse.json({ summary })
}
