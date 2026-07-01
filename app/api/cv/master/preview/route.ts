import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserBillingContext } from '@/lib/db/users'
import { getDefaultMasterCV } from '@/lib/db/cvs'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await getUserBillingContext(supabase, user.id)
  if (plan !== 'pro' && plan !== 'accelerator') {
    return NextResponse.json({ error: 'Upgrade to Pro or Accelerator to view your Default Master CV.' }, { status: 403 })
  }

  const cv = await getDefaultMasterCV(supabase, user.id)
  if (!cv || cv.generation_status !== 'ready' || !cv.content_markdown) {
    return NextResponse.json({ error: 'Your Default Master CV is not ready yet.' }, { status: 409 })
  }

  return NextResponse.json({
    displayName: cv.display_name ?? 'Default Master CV',
    markdown: cv.content_markdown,
    atsScore: cv.ats_score,
    marketGaps: cv.market_gaps ?? [],
  })
}
