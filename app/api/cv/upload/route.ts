import { NextRequest, NextResponse, after } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase'
import { insertCV, getCVsByUser, upsertDefaultMasterCV } from '@/lib/db/cvs'
import { getUserBillingContext } from '@/lib/db/users'
import { checkQuota } from '@/lib/rate-limit'
import { generateAndStoreMasterCV } from '@/lib/cv/master'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, locale } = await getUserBillingContext(supabase, user.id)
  const { allowed, code, lockedUntil } = await checkQuota(supabase, user.id, plan, 'cv_upload', locale)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Free plan allows 1 CV upload. Upgrade to upload more.', code, lockedUntil },
      { status: 429 },
    )
  }

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
      const { extractText, getDocumentProxy } = await import('unpdf')
      const pdf = await getDocumentProxy(new Uint8Array(buffer))
      const { text } = await extractText(pdf, { mergePages: true })
      rawText = (Array.isArray(text) ? text.join('\n') : text).trim()
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

    // Auto-generate the Default Master CV for eligible members on their first CV.
    let masterCvTriggered = false
    if (isPrimary && (plan === 'pro' || plan === 'accelerator')) {
      masterCvTriggered = true
      await upsertDefaultMasterCV(admin, user.id, {
        generation_status: 'generating',
        generation_stage: 'queued',
        generation_error: null,
        membership_plan_at_generation: plan,
      })
      after(async () => {
        try {
          await generateAndStoreMasterCV(admin, user.id, plan)
        } catch (bgErr) {
          Sentry.captureException(bgErr, { extra: { userId: user.id, feature: 'master_cv_autotrigger' } })
        }
      })
    }

    return NextResponse.json({
      cvId: cv.id,
      rawText,
      preview: rawText.slice(0, 300),
      isPrimary,
      masterCvTriggered,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
