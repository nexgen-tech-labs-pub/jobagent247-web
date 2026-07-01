import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserBillingContext } from '@/lib/db/users'
import { getDefaultMasterCV, upsertDefaultMasterCV } from '@/lib/db/cvs'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await getUserBillingContext(supabase, user.id)
  if (plan !== 'pro' && plan !== 'accelerator') {
    return NextResponse.json({ error: 'Upgrade to Pro or Accelerator.' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({})) as { name?: string }
  const name = body.name?.trim()
  if (!name || name.length > 80) {
    return NextResponse.json({ error: 'Provide a name between 1 and 80 characters.' }, { status: 400 })
  }

  const cv = await getDefaultMasterCV(supabase, user.id)
  if (!cv) return NextResponse.json({ error: 'No Default Master CV to rename.' }, { status: 404 })

  await upsertDefaultMasterCV(supabase, user.id, { display_name: name })
  return NextResponse.json({ displayName: name })
}
