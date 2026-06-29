import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
} from 'docx'
import { buildCvDocxFromMarkdown, type CvDocxResult } from './cv-docx'

/**
 * Build a recruiter-ready CV .docx from the generator's Markdown-ish content.
 * Parses Markdown into clean Word styles (Calibri, real bullets, grouped skills,
 * pagination control) — never pastes raw Markdown into the document.
 */
export async function buildCvDocx(opts: {
  name: string
  markdown: string
}): Promise<CvDocxResult> {
  return buildCvDocxFromMarkdown({ markdown: opts.markdown, name: opts.name })
}

export async function buildLetterDocx(opts: {
  title: string
  content: string
}): Promise<Buffer> {
  const paragraphs = opts.content.split('\n\n').map(block =>
    new Paragraph({
      children: [new TextRun({ text: block.trim(), size: 22 })],
      spacing: { after: 200 },
    })
  )

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ text: opts.title, heading: HeadingLevel.HEADING_1, spacing: { after: 240 } }),
        ...paragraphs,
      ],
    }],
  })
  return Buffer.from(await Packer.toBuffer(doc))
}

