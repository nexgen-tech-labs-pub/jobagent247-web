import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generateFollowUpDraft } from '@/lib/claude'
import { checkQuota } from '@/lib/rate-limit'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('follow_up_drafts')
    .select('*')
    .eq('follow_up_recommendation_id', id)
    .eq('user_id', user.id)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (error) return NextResponse.json({ draft: null })
  return NextResponse.json({ draft: data })
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('plan, locale, name').eq('id', user.id).single()
  const plan = (userData?.plan ?? 'free') as 'free' | 'pro' | 'accelerator'
  const locale = (userData?.locale ?? 'uk') as 'uk' | 'in'

  const { allowed, code, lockedUntil } = await checkQuota(supabase, user.id, plan, 'follow_up_draft', locale)
  if (!allowed) return NextResponse.json({ error: 'Follow-up draft limit reached. Upgrade to Pro.', code, lockedUntil }, { status: 429 })

  const { data: rec } = await supabase
    .from('follow_up_recommendations')
    .select(`
      recommendation_type, reason, provider_thread_id, connected_email_account_id,
      source_message:synced_email_messages!source_message_id(subject, body_text, sender)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!rec) return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })

  const sourceMsg = rec.source_message as unknown as { subject: string; body_text: string; sender: string } | null
  const threadMessages = await supabase
    .from('synced_email_messages')
    .select('body_text, received_at, sender')
    .eq('connected_email_account_id', rec.connected_email_account_id as string)
    .eq('provider_thread_id', rec.provider_thread_id as string)
    .order('received_at', { ascending: false })
    .limit(5)

  const threadContext = (threadMessages.data ?? []).map(m => `[${m.sender}]: ${m.body_text.slice(0, 400)}`).join('\n\n')

  const draftResult = await generateFollowUpDraft(
    sourceMsg?.subject ?? '',
    threadContext,
    null,
    null,
    rec.recommendation_type as string,
    rec.reason as string,
    userData?.name ?? null,
  )

  const { data: existing } = await supabase
    .from('follow_up_drafts')
    .select('version')
    .eq('follow_up_recommendation_id', id)
    .eq('user_id', user.id)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  const nextVersion = (existing?.version ?? 0) + 1
  const { data: draft } = await supabase
    .from('follow_up_drafts')
    .insert({
      user_id:                       user.id,
      follow_up_recommendation_id:   id,
      subject:                       draftResult.subject,
      body:                          draftResult.body,
      placeholders:                  draftResult.placeholders,
      generation_context:            `type=${rec.recommendation_type},confidence=${draftResult.confidence}`,
      version:                       nextVersion,
    })
    .select()
    .single()

  await supabase
    .from('follow_up_recommendations')
    .update({ status: 'draft_ready', updated_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ draft })
}
