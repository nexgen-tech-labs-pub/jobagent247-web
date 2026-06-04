import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getAnalysisById } from '@/lib/db/job-fit'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const analysis = await getAnalysisById(supabase, user.id, id)
  if (!analysis) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(analysis)
}
