import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { buildCvDocx } from '@/lib/docx-export'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { text: string; name?: string }
  if (!body.text?.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  try {
    const { buffer } = await buildCvDocx({
      name: body.name ?? 'My CV',
      markdown: body.text,
    })

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="cv.docx"',
      },
    })
  } catch (err) {
    console.error('[export/text]', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
