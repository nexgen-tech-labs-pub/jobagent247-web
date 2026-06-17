import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('founding_spots_remaining')
    .select('spots_remaining')
    .single()
  return NextResponse.json({ spotsRemaining: data?.spots_remaining ?? 0 })
}
