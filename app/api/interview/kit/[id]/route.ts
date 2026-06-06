import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getInterviewKit } from '@/lib/db/interview'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const kit = await getInterviewKit(supabase, user.id, id)
  if (!kit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(kit)
}
