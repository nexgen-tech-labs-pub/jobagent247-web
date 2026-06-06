import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { listInterviewKits } from '@/lib/db/interview'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const kits = await listInterviewKits(supabase, user.id)
  return NextResponse.json(kits)
}
