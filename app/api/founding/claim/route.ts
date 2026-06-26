import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

type ClaimResult = { ok: boolean; reason?: string }

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as { code?: string } | null
  const code = body?.code?.trim()
  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 })

  const { data, error } = await supabase.rpc('claim_founding_code', {
    p_user_id: user.id,
    p_code: code,
  })

  if (error) {
    return NextResponse.json({ error: 'Could not validate code' }, { status: 500 })
  }

  const result = data as ClaimResult | null
  if (!result?.ok) {
    const messages: Record<string, string> = {
      INVALID_CODE: 'That code isn\'t valid.',
      CODE_ALREADY_USED: 'That code has already been used.',
      CODE_EXPIRED: 'That code has expired.',
      NO_SPOTS_REMAINING: 'All 100 founding spots have been claimed.',
    }
    const reason = result?.reason ?? 'INVALID_CODE'
    return NextResponse.json({ error: messages[reason] ?? 'Could not claim spot', reason }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
