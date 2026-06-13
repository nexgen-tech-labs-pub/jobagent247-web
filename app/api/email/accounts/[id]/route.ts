import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { action?: string }
  if (body.action !== 'pause' && body.action !== 'resume') {
    return NextResponse.json({ error: 'action must be pause or resume' }, { status: 400 })
  }

  const { error } = await supabase
    .from('connected_email_accounts')
    .update({ connection_status: body.action === 'pause' ? 'paused' : 'active', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase
    .from('connected_email_accounts')
    .update({ connection_status: 'disconnected', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  return new NextResponse(null, { status: 204 })
}
