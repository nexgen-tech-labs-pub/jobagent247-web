import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { updateUser } from '@/lib/db/users'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await updateUser(supabase, authUser.id, { onboarding_complete: true })

  // Founding-member trial is no longer auto-granted. New users stay on Free
  // until an admin invokes claim_founding_spot() manually in SQL, or until a
  // Stripe subscription event upgrades them via the billing webhook.
  return NextResponse.json({
    success: true,
    foundingMember: false,
    structuredProfile: {
      skills: [],
      experienceYears: 0,
      targetRoles: [],
      gaps: [],
    },
  })
}
