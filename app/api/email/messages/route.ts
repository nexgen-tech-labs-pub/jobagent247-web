import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10))
  const limit = Math.min(50, parseInt(sp.get('limit') ?? '20', 10))
  const offset = (page - 1) * limit
  const filter = sp.get('filter')

  let query = supabase
    .from('synced_email_messages')
    .select('id, sender, subject, received_at, classification, snippet, action_required, linked_application_id', { count: 'exact' })
    .eq('user_id', user.id)
    .order('received_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (filter === 'action_required') query = query.eq('action_required', true)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data ?? [], total: count ?? 0, page })
}
