import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { gmailAdapter } from '@/lib/email/adapters/gmail'
import { microsoftAdapter } from '@/lib/email/adapters/microsoft'
import { randomBytes } from 'crypto'

const INBOX_LIMITS: Record<string, number> = {
  free:         0,
  pro:          1,
  accelerator:  5,
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  if (provider !== 'gmail' && provider !== 'microsoft') {
    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = (userData?.plan ?? 'free') as string
  const inboxLimit = INBOX_LIMITS[plan] ?? 0

  if (inboxLimit === 0) {
    return NextResponse.redirect(new URL('/follow-ups/accounts?error=plan_required', request.url))
  }

  const { count } = await supabase
    .from('connected_email_accounts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('connection_status', 'eq', 'disconnected')

  if ((count ?? 0) >= inboxLimit) {
    return NextResponse.redirect(new URL('/follow-ups/accounts?error=limit_reached', request.url))
  }

  const state = `${user.id}:${randomBytes(16).toString('hex')}`
  const adapter = provider === 'gmail' ? gmailAdapter : microsoftAdapter
  const authUrl = adapter.getAuthorizationUrl(state)

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('oauth_state', state, { httpOnly: true, secure: true, maxAge: 600, path: '/' })
  return response
}
