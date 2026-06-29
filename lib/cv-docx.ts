// CV → recruiter-ready .docx renderer.
//
// The CV generator (streamCVImprovement) emits Markdown-ish text. This module
// parses that text into a structured model and renders a clean Word document
// with consistent Calibri typography, real bullet lists, grouped skills, and
// pagination control — never pasting raw Markdown into the document.
//
// See GitHub issue #66 for the full formatting contract.

import {
  Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle,
  LevelFormat, convertInchesToTwip,
} from 'docx'

// Sizes are in half-points (docx convention): 11pt = 22, 14pt = 28, 15pt = 30, etc.
const FONT = 'Calibri'
const SIZE = {
  name: 36, // 18pt
  contact: 21, // 10.5pt
  heading: 30, // 15pt
  subheading: 23, // 11.5pt
  body: 22, // 11pt
} as const

const CANONICAL_SECTIONS = [
  'professional summary', 'summary', 'profile', 'objective',
  'core technical skills', 'technical skills', 'key skills', 'skills',
  'professional experience', 'work experience', 'experience', 'employment history', 'employment',
  'key projects', 'selected achievements', 'projects', 'achievements',
  'certifications', 'certification', 'licenses & certifications',
  'education', 'qualifications',
  'additional information', 'interests', 'languages', 'references',
]

const BULLET_PREFIX = /^[•‣◦⁃∙*\-–—]\s+/
const SEPARATOR_LINE = /^[\s*_=–—-]{2,}$/
const PLACEHOLDER_BULLET = /^(?:[-–—*•]+|n\/?a|tbd|todo|none|null)$/i
const INLINE_TOKEN = /(\*\*|__)(.+?)\1|(\*|_)(?!\s)(.+?)(?<!\s)\3/g

export interface InlineRun {
  text: string
  bold?: boolean
  italics?: boolean
}

export type CvBlock =
  | { kind: 'bullet'; runs: InlineRun[] }
  | { kind: 'para'; runs: InlineRun[] }
  | { kind: 'subheading'; runs: InlineRun[] }
  | { kind: 'skill'; label: string; value: string }

export interface CvSection {
  title: string
  blocks: CvBlock[]
}

export interface CvModel {
  name?: string
  contact?: string
  intro: CvBlock[]
  sections: CvSection[]
}

// ─── Inline Markdown parsing ────────────────────────────────────────────────

export function parseInline(raw: string): InlineRun[] {
  // Strip code backticks and normalise; convert **bold**/__bold__ and *italic*/_italic_.
  const text = raw.replace(/`+/g, '').trim()
  const runs: InlineRun[] = []
  let last = 0
  for (const m of text.matchAll(INLINE_TOKEN)) {
    const idx = m.index ?? 0
    if (idx > last) runs.push({ text: text.slice(last, idx) })
    if (m[2] !== undefined) runs.push({ text: m[2], bold: true })
    else if (m[4] !== undefined) runs.push({ text: m[4], italics: true })
    last = idx + m[0].length
  }
  if (last < text.length) runs.push({ text: text.slice(last) })

  // Collapse residual stray markers, drop empty runs.
  return runs
    .map((r) => ({ ...r, text: r.text.replace(/\*\*|__/g, '').replace(/\s+/g, ' ') }))
    .filter((r) => r.text.trim().length > 0)
}

function plainText(items: InlineRun[]): string {
  return items.map((r) => r.text).join('')
}

// ─── Markdown → model ───────────────────────────────────────────────────────

function stripHeadingMarkers(line: string): string {
  return line.replace(/^#{1,6}\s*/, '').replace(/\*\*|__/g, '').replace(/[:：]\s*$/, '').trim()
}

function isHeading(line: string): boolean {
  const t = line.trim()
  if (/^#{1,6}\s+\S/.test(t)) return true
  const bare = stripHeadingMarkers(t)
  if (!bare) return false
  if (CANONICAL_SECTIONS.includes(bare.toLowerCase())) return true
  // ALL CAPS short line (e.g. "CERTIFICATIONS"), letters/spaces/&/ only.
  if (bare.length <= 40 && /^[A-Z][A-Z &/]+$/.test(bare) && /[A-Z]{3,}/.test(bare)) return true
  return false
}

function asSkillLine(line: string): { label: string; value: string } | null {
  // "**Cloud Platforms:** AWS, Azure" | "Cloud Platforms: AWS, Azure"
  const cleaned = line.replace(BULLET_PREFIX, '').trim()
  const m = cleaned.match(/^\*{0,2}([A-Za-z][A-Za-z0-9 &/+().-]{1,34}?)\*{0,2}\s*:\s*(.+)$/)
  if (!m) return null
  const label = m[1].replace(/\*\*|__/g, '').trim()
  const value = m[2].replace(/\*\*|__/g, '').trim()
  if (!value) return null
  // Reject sentence-like labels — keep it a true category label.
  if (/[.!?]$/.test(label)) return null
  return { label, value }
}

export function parseCvMarkdown(markdown: string, fallbackName?: string): CvModel {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const model: CvModel = { intro: [], sections: [] }

  // Header detection: first non-empty line is the name unless it's a heading.
  let i = 0
  while (i < lines.length && !lines[i].trim()) i++
  if (i < lines.length && !isHeading(lines[i]) && !BULLET_PREFIX.test(lines[i].trim())) {
    const firstClean = stripHeadingMarkers(lines[i])
    // Treat as name only if it's short and not a "Label: value" line.
    if (firstClean && firstClean.length <= 60 && !/:/.test(firstClean)) {
      model.name = firstClean
      i++
      // Optional contact line directly after the name.
      while (i < lines.length && !lines[i].trim()) i++
      if (i < lines.length && !isHeading(lines[i]) && /[@|·•]|\+?\d|linkedin|github|http/i.test(lines[i])) {
        model.contact = lines[i].replace(/\*\*|__/g, '').trim()
        i++
      }
    }
  }
  if (!model.name && fallbackName) model.name = fallbackName

  let current: CvSection | null = null
  const target = () => (current ? current.blocks : model.intro)

  for (; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || SEPARATOR_LINE.test(line) || /^[-–—*•∙·_=]+$/.test(line)) continue

    if (isHeading(line)) {
      current = { title: stripHeadingMarkers(line).toUpperCase(), blocks: [] }
      model.sections.push(current)
      continue
    }

    const isSkillsSection = !!current && /SKILL/.test(current.title)
    if (isSkillsSection) {
      const skill = asSkillLine(line)
      if (skill) { target().push({ kind: 'skill', label: skill.label, value: skill.value }); continue }
    }

    if (BULLET_PREFIX.test(line)) {
      const body = line.replace(BULLET_PREFIX, '').trim()
      if (!body || PLACEHOLDER_BULLET.test(body)) continue // drop empty / placeholder bullets
      const runs = parseInline(body)
      if (runs.length === 0) continue
      target().push({ kind: 'bullet', runs })
      continue
    }

    const runs = parseInline(line)
    if (runs.length === 0) continue

    // A non-bullet line immediately followed by a bullet is a job/role subheading;
    // keep it with its bullets so it never gets orphaned at a page break.
    const next = lines[i + 1]?.trim() ?? ''
    if (BULLET_PREFIX.test(next)) {
      target().push({ kind: 'subheading', runs })
    } else {
      target().push({ kind: 'para', runs })
    }
  }

  // Drop empty sections (heading with no content).
  model.sections = model.sections.filter((s) => s.blocks.length > 0)
  return model
}

// ─── Quality gate ───────────────────────────────────────────────────────────

export function findCvFormattingIssues(visibleText: string): string[] {
  const issues: string[] = []
  if (/(^|\n)\s*#{1,6}\s/.test(visibleText)) issues.push('Markdown heading markers (#) remain in visible text')
  if (/\*\*/.test(visibleText)) issues.push('Bold markers (**) remain in visible text')
  if (/(^|\n)\s*--\s*(\n|$)/.test(visibleText)) issues.push('Separator/placeholder bullet (--) present')
  if (/(^|\n)[ \t]*[-*•][ \t]*(\n|$)/.test(visibleText)) issues.push('Empty bullet point present')
  return issues
}

// ─── Model → docx ───────────────────────────────────────────────────────────

function runs(items: InlineRun[], size: number): TextRun[] {
  return items.map((r) => new TextRun({ text: r.text, bold: r.bold, italics: r.italics, font: FONT, size }))
}

function renderBlock(block: CvBlock): Paragraph {
  switch (block.kind) {
    case 'subheading':
      return new Paragraph({
        children: runs(block.runs.map((r) => ({ ...r, bold: true })), SIZE.subheading),
        spacing: { before: 120, after: 40 },
        keepNext: true,
        keepLines: true,
      })
    case 'bullet':
      return new Paragraph({
        children: runs(block.runs, SIZE.body),
        numbering: { reference: 'cv-bullets', level: 0 },
        spacing: { after: 40 },
        keepLines: true,
      })
    case 'skill':
      return new Paragraph({
        children: [
          new TextRun({ text: `${block.label}: `, bold: true, font: FONT, size: SIZE.body }),
          new TextRun({ text: block.value, font: FONT, size: SIZE.body }),
        ],
        spacing: { after: 40 },
        keepLines: true,
      })
    case 'para':
      return new Paragraph({
        children: runs(block.runs, SIZE.body),
        spacing: { after: 80 },
      })
  }
}

function renderSectionHeading(title: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: title, bold: true, font: FONT, size: SIZE.heading })],
    spacing: { before: 220, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '8B5CF6', space: 2 } },
    keepNext: true,
    keepLines: true,
  })
}

export function renderCvModel(model: CvModel): Document {
  const children: Paragraph[] = []

  if (model.name) {
    children.push(new Paragraph({
      children: [new TextRun({ text: model.name, bold: true, font: FONT, size: SIZE.name })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      keepNext: true,
    }))
  }
  if (model.contact) {
    children.push(new Paragraph({
      children: [new TextRun({ text: model.contact, font: FONT, size: SIZE.contact, color: '555555' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
    }))
  }

  for (const block of model.intro) children.push(renderBlock(block))

  for (const section of model.sections) {
    children.push(renderSectionHeading(section.title))
    for (const block of section.blocks) children.push(renderBlock(block))
  }

  return new Document({
    styles: {
      default: { document: { run: { font: FONT, size: SIZE.body } } },
    },
    numbering: {
      config: [{
        reference: 'cv-bullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.18) } } },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4 in twips
          margin: {
            top: convertInchesToTwip(0.7), bottom: convertInchesToTwip(0.7),
            left: convertInchesToTwip(0.7), right: convertInchesToTwip(0.7),
          },
        },
      },
      children,
    }],
  })
}

export interface CvDocxResult {
  buffer: Buffer
  warnings: string[]
}

function blockText(block: CvBlock): string {
  if (block.kind === 'skill') return `${block.label}: ${block.value}`
  return plainText(block.runs)
}

export async function buildCvDocxFromMarkdown(opts: {
  markdown: string
  name?: string
}): Promise<CvDocxResult> {
  const model = parseCvMarkdown(opts.markdown, opts.name)

  // Quality gate runs on the visible text the renderer will actually emit.
  const visible = [
    model.name ?? '', model.contact ?? '',
    ...model.intro.map(blockText),
    ...model.sections.flatMap((s) => [s.title, ...s.blocks.map(blockText)]),
  ].join('\n')

  const buffer = Buffer.from(await Packer.toBuffer(renderCvModel(model)))
  return { buffer, warnings: findCvFormattingIssues(visible) }
}
