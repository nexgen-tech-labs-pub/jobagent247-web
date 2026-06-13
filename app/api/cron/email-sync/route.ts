import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncAccount } from '@/lib/email/sync-engine'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: accounts } = await supabase
    .from('connected_email_accounts')
    .select('id, user_id')
    .eq('connection_status', 'active')
    .order('last_sync_attempt_at', { ascending: true, nullsFirst: true })
    .limit(20)

  if (!accounts?.length) return NextResponse.json({ message: 'No active accounts' })

  const results = await Promise.allSettled(
    accounts.map(a => syncAccount(supabase, a.id, 'scheduled'))
  )

  const summary = {
    synced: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
  }

  return NextResponse.json(summary)
}
