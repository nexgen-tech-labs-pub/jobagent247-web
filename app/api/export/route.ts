import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient } from '@/lib/supabase'
import { buildCvDocx, buildLetterDocx } from '@/lib/docx-export'

const logger = console

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('plan').eq('id', user.id).single()
  if (!profile || profile.plan === 'free') {
    return NextResponse.json({ error: 'Export requires Pro or Accelerator plan' }, { status: 403 })
  }

  const body = await req.json() as {
    type: 'cv' | 'cover_letter' | 'recruiter_message'
    document_id: string
  }

  const { data: doc } = await supabase
    .from('documents')
    .select('id, type, content, title')
    .eq('id', body.document_id)
    .eq('user_id', user.id)
    .single()

  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  try {
    let buffer: Buffer
    let filename: string

    if (body.type === 'cv') {
      const content = typeof doc.content === 'string' ? doc.content : JSON.stringify(doc.content)
      buffer = await buildCvDocx({
        name: (doc.title as string) ?? 'CV',
        role: '',
        contact: '',
        sections: [{ title: 'Content', content }],
      })
      filename = 'cv.docx'
    } else {
      const content = typeof doc.content === 'string' ? doc.content : JSON.stringify(doc.content)
      buffer = await buildLetterDocx({ title: (doc.title as string) ?? 'Document', content })
      filename = body.type === 'cover_letter' ? 'cover-letter.docx' : 'recruiter-message.docx'
    }

    const { data: upload, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`${user.id}/${doc.id}/${filename}`, buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: true,
      })

    if (uploadError) {
      Sentry.captureException(uploadError, { extra: { document_id: doc.id } })
      logger.error('[export] Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: signed } = await supabase.storage
      .from('documents')
      .createSignedUrl(upload.path, 1800)

    return NextResponse.json({ url: signed?.signedUrl })
  } catch (err) {
    Sentry.setUser({ id: user.id })
    Sentry.captureException(err)
    logger.error('[export] DOCX generation error:', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
