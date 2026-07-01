import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient } from '@/lib/supabase'
import { getUserBillingContext } from '@/lib/db/users'
import { setDefaultCV } from '@/lib/db/cvs'

// Choose which CV is the user's default/go-to CV (used across download/apply flows).
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await getUserBillingContext(supabase, user.id)
  if (plan !== 'pro' && plan !== 'accelerator') {
    return NextResponse.json({ error: 'Upgrade to Pro or Accelerator.' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({})) as { cvId?: string }
  if (!body.cvId) return NextResponse.json({ error: 'cvId is required' }, { status: 400 })

  try {
    await setDefaultCV(supabase, body.cvId, user.id)
    return NextResponse.json({ ok: true, cvId: body.cvId })
  } catch (err) {
    if (err instanceof Error && err.message === 'CV not found') {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 })
    }
    Sentry.captureException(err, { extra: { userId: user.id } })
    return NextResponse.json({ error: 'Could not set default CV' }, { status: 500 })
  }
}
