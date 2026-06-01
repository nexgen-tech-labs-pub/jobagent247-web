import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { updateUser } from '@/lib/db/users'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await updateUser(supabase, authUser.id, { onboarding_complete: true })

  // Phase 3: trigger Profile Agent here (Claude API call)
  // For now return a stub structured profile
  return NextResponse.json({
    success: true,
    structuredProfile: {
      skills: [],
      experienceYears: 0,
      targetRoles: [],
      gaps: [],
    },
  })
}
