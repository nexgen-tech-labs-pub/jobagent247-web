import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('follow_up_recommendations')
    .select(`
      id, recommendation_type, reason, urgency, confidence, recommended_send_at, status, created_at,
      source_message:synced_email_messages!source_message_id(sender, subject, received_at, classification, snippet)
    `)
    .eq('user_id', user.id)
    .in('status', ['pending', 'draft_ready'])
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ followUps: data ?? [] })
}
