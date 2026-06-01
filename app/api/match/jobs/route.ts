import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { searchJobs } from '@/lib/db/jobs'
import type { JobType } from '@/lib/types/database'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const keyword = searchParams.get('keyword') ?? ''
  const type = (searchParams.get('type') ?? '') as JobType | ''
  const visa = searchParams.get('visa') === 'true'
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)

  try {
    const result = await searchJobs(supabase, user.id, { keywords: keyword, type, visa, page, limit })
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
