import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { EvidenceAssetType, EvidenceBundle } from '@/lib/types/database'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('evidence_assets')
    .select('id, asset_type, title, target_role, skill_or_gap, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ assets: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    assetType?: EvidenceAssetType
    title?: string
    targetRole?: string
    skillOrGap?: string
    content?: EvidenceBundle
  }

  const { assetType, title, targetRole, skillOrGap, content } = body
  if (!assetType || !title || !targetRole || !content) {
    return NextResponse.json({ error: 'assetType, title, targetRole and content are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('evidence_assets')
    .insert({
      user_id: user.id,
      asset_type: assetType,
      title,
      target_role: targetRole,
      skill_or_gap: skillOrGap ?? null,
      content,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
