import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient } from '@/lib/supabase'
import { getUserBillingContext } from '@/lib/db/users'
import { getDefaultMasterCV } from '@/lib/db/cvs'
import { buildCvDocx } from '@/lib/docx-export'
import { buildCvPdfFromMarkdown } from '@/lib/cv-pdf'

const DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await getUserBillingContext(supabase, user.id)
  if (plan !== 'pro' && plan !== 'accelerator') {
    return NextResponse.json({ error: 'Upgrade to Pro or Accelerator to download your Default Master CV.' }, { status: 403 })
  }

  const cv = await getDefaultMasterCV(supabase, user.id)
  if (!cv || cv.generation_status !== 'ready' || !cv.content_markdown) {
    return NextResponse.json({ error: 'Your Default Master CV is not ready yet.' }, { status: 409 })
  }

  const body = await req.json().catch(() => ({})) as { format?: 'docx' | 'pdf' }
  const format = body.format === 'pdf' ? 'pdf' : 'docx'
  const name = cv.display_name ?? 'Default Master CV'

  try {
    let buffer: Buffer
    let contentType: string
    if (format === 'pdf') {
      buffer = await buildCvPdfFromMarkdown({ name, markdown: cv.content_markdown })
      contentType = 'application/pdf'
    } else {
      const docx = await buildCvDocx({ name, markdown: cv.content_markdown })
      if (docx.warnings.length > 0) {
        Sentry.captureMessage('Master CV export formatting warnings', { level: 'warning', extra: { cv_id: cv.id, warnings: docx.warnings } })
      }
      buffer = docx.buffer
      contentType = DOCX_TYPE
    }

    const path = `${user.id}/master/default-master-cv.${format}`
    const { data: upload, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, buffer, { contentType, upsert: true })
    if (uploadError) {
      Sentry.captureException(uploadError, { extra: { cv_id: cv.id } })
      return NextResponse.json({ error: 'Download failed' }, { status: 500 })
    }

    const { data: signed } = await supabase.storage.from('documents').createSignedUrl(upload.path, 1800)
    return NextResponse.json({ url: signed?.signedUrl, format })
  } catch (err) {
    Sentry.setUser({ id: user.id })
    Sentry.captureException(err)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
