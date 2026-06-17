import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { updateUser } from '@/lib/db/users'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await updateUser(supabase, authUser.id, { onboarding_complete: true })

  // Claim a founding spot (first 100 users get 30-day Pro free)
  const { data: claimed } = await supabase.rpc('claim_founding_spot', { p_user_id: authUser.id })

  return NextResponse.json({
    success: true,
    foundingMember: claimed === true,
    structuredProfile: {
      skills: [],
      experienceYears: 0,
      targetRoles: [],
      gaps: [],
    },
  })
}
