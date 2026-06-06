import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getInterviewKit, createMockSession } from '@/lib/db/interview'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { kitId: string }
  if (!body.kitId) return NextResponse.json({ error: 'kitId is required' }, { status: 400 })

  const kit = await getInterviewKit(supabase, user.id, body.kitId)
  if (!kit) return NextResponse.json({ error: 'Interview kit not found' }, { status: 404 })

  try {
    const session = await createMockSession(supabase, user.id, body.kitId)
    return NextResponse.json({ session, questions: kit.questions })
  } catch {
    return NextResponse.json({ error: 'Failed to create mock session' }, { status: 500 })
  }
}
