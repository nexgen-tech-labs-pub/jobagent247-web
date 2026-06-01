import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase'
import { insertCV, getCVsByUser } from '@/lib/db/cvs'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    storagePath: string
    fileName: string
    versionLabel?: string
    fileSize: number
  }

  if (body.fileSize > MAX_SIZE) {
    return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 })
  }

  const ext = body.fileName.split('.').pop()?.toLowerCase()
  if (ext !== 'docx' && ext !== 'pdf') {
    return NextResponse.json({ error: 'Only .docx and .pdf files are supported' }, { status: 400 })
  }

  try {
    // Download file from Storage using service role (bypasses RLS)
    const admin = createAdminClient()
    const { data: fileData, error: downloadError } = await admin.storage
      .from('cvs')
      .download(body.storagePath)

    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'Failed to read uploaded file' }, { status: 500 })
    }

    // Extract text
    let rawText = ''
    const buffer = Buffer.from(await fileData.arrayBuffer())

    if (ext === 'docx') {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      rawText = result.value.trim()
    } else {
      const { createRequire } = await import('module')
      const req = createRequire(import.meta.url)
      const pdfParse = req('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
      const result = await pdfParse(buffer)
      rawText = result.text.trim()
    }

    // Determine if this is the user's first CV
    const existing = await getCVsByUser(supabase, user.id)
    const isPrimary = existing.length === 0

    const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cvs/${body.storagePath}`

    const cv = await insertCV(supabase, {
      user_id: user.id,
      file_name: body.fileName,
      file_url: fileUrl,
      raw_text: rawText,
      ats_score: null,
      version_label: body.versionLabel ?? null,
      is_primary: isPrimary,
    })

    return NextResponse.json({
      cvId: cv.id,
      rawText,
      preview: rawText.slice(0, 300),
      isPrimary,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
