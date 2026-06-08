import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle,
} from 'docx'

interface CvSection {
  title: string
  content: string
}

export async function buildCvDocx(opts: {
  name: string
  role: string
  contact: string
  sections: CvSection[]
}): Promise<Buffer> {
  const { name, role, contact, sections } = opts

  const children: Paragraph[] = [
    new Paragraph({
      text: name,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: role, bold: true, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: contact, size: 20, color: '555555' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
  ]

  for (const section of sections) {
    children.push(
      new Paragraph({
        text: section.title.toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '8B5CF6' } },
        spacing: { before: 240, after: 120 },
      })
    )
    for (const line of section.content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')
      children.push(
        new Paragraph({
          children: [new TextRun({ text: isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : trimmed, size: 22 })],
          bullet: isBullet ? { level: 0 } : undefined,
          spacing: { after: 60 },
        })
      )
    }
  }

  const doc = new Document({ sections: [{ properties: {}, children }] })
  return Buffer.from(await Packer.toBuffer(doc))
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

