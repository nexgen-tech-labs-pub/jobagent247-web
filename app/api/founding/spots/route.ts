import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = await createServerClient()
  const { data } = await supabase.from('founding_spots_remaining').select('spots_remaining').single()
  const remaining = (data?.spots_remaining as number | undefined) ?? 0
  return NextResponse.json({ remaining, total: 100 })
}
