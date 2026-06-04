import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { listAnalysesForUser } from '@/lib/db/job-fit'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const analyses = await listAnalysesForUser(supabase, user.id)
  return NextResponse.json(analyses)
}
