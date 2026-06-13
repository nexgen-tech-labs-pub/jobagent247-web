import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { gmailAdapter } from '@/lib/email/adapters/gmail'
import { microsoftAdapter } from '@/lib/email/adapters/microsoft'
import { encryptToken } from '@/lib/email/crypto'
import { syncAccount } from '@/lib/email/sync-engine'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  if (provider !== 'gmail' && provider !== 'microsoft') {
    return NextResponse.redirect(new URL('/follow-ups/accounts?error=unsupported_provider', request.url))
  }

  const sp = request.nextUrl.searchParams
  const code = sp.get('code')
  const state = sp.get('state')
  const storedState = request.cookies.get('oauth_state')?.value

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL('/follow-ups/accounts?error=invalid_state', request.url))
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const adapter = provider === 'gmail' ? gmailAdapter : microsoftAdapter

  try {
    const tokens = await adapter.exchangeAuthorizationCode(code)
    const [emailAddress, providerAccountId] = await Promise.all([
      adapter.getAccountEmail(tokens.accessToken),
      adapter.getAccountId(tokens.accessToken),
    ])

    const { data: existing } = await supabase
      .from('connected_email_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .eq('provider_account_id', providerAccountId)
      .single()

    if (existing) {
      await supabase.from('connected_email_accounts').update({
        encrypted_access_token:  encryptToken(tokens.accessToken),
        encrypted_refresh_token: encryptToken(tokens.refreshToken),
        connection_status:       'active',
      }).eq('id', existing.id)
      return NextResponse.redirect(new URL('/follow-ups/accounts?success=reconnected', request.url))
    }

    const validation = await adapter.validateContainer(tokens.accessToken)
    const { data: account } = await supabase
      .from('connected_email_accounts')
      .insert({
        user_id:                    user.id,
        provider,
        email_address:              emailAddress,
        provider_account_id:        providerAccountId,
        encrypted_access_token:     encryptToken(tokens.accessToken),
        encrypted_refresh_token:    encryptToken(tokens.refreshToken),
        required_container_name:    adapter.requiredContainerName,
        provider_container_id:      validation.containerId,
        connection_status:          validation.exists ? 'active' : 'pending',
      })
      .select('id')
      .single()

    if (account && validation.exists) {
      void syncAccount(supabase, account.id, 'initial')
    }

    const redirect = validation.exists
      ? '/follow-ups/accounts?success=connected'
      : `/follow-ups/accounts?success=connected&setup_required=${provider}`
    return NextResponse.redirect(new URL(redirect, request.url))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'oauth_error'
    return NextResponse.redirect(new URL(`/follow-ups/accounts?error=${encodeURIComponent(msg)}`, request.url))
  }
}
