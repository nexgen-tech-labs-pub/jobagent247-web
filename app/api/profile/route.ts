import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUser, upsertUser, updateUser } from '@/lib/db/users'
import type { User } from '@/lib/types/database'

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getUser(supabase, authUser.id)

    // First visit — create skeleton row
    if (!profile) {
      const created = await upsertUser(supabase, {
        id: authUser.id,
        name: authUser.user_metadata?.full_name ?? null,
        email: authUser.email ?? null,
        location: null,
        current_role: null,
        target_roles: null,
        visa_required: false,
        job_type_pref: null,
        location_pref: null,
        priority: null,
        keywords: null,
        onboarding_complete: false,
        plan: 'free',
      })
      return NextResponse.json(created)
    }

    return NextResponse.json(profile)
  } catch (err) {
    console.error('[GET /api/profile]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as Partial<Omit<User, 'id' | 'created_at' | 'onboarding_complete'>>

    const updated = await updateUser(supabase, authUser.id, body)
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PUT /api/profile]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
