// CV → recruiter-ready PDF. Reuses the same Markdown→CvModel parser as the DOCX
// exporter (lib/cv-docx.ts) so the PDF and DOCX stay visually consistent. Runs
// in-process (no LibreOffice/Gotenberg service). Calibri is proprietary, so the
// PDF uses the built-in Helvetica family — a clean, ATS-friendly sans-serif.

import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { parseCvMarkdown, type CvModel, type CvBlock, type InlineRun } from './cv-docx'

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 44, paddingHorizontal: 44, fontSize: 10.5, fontFamily: 'Helvetica', color: '#1a1a1a', lineHeight: 1.35 },
  name: { fontSize: 18, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 3 },
  contact: { fontSize: 9.5, textAlign: 'center', color: '#555555', marginBottom: 12 },
  heading: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginTop: 12, marginBottom: 5, paddingBottom: 2, borderBottomWidth: 1, borderBottomColor: '#8B5CF6' },
  subheading: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 5, marginBottom: 2 },
  para: { marginBottom: 4 },
  bulletRow: { flexDirection: 'row', marginBottom: 2, paddingLeft: 8 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1 },
  skill: { marginBottom: 2 },
  bold: { fontFamily: 'Helvetica-Bold' },
  italic: { fontFamily: 'Helvetica-Oblique' },
})

function inlineRuns(items: InlineRun[]) {
  return items.map((r, i) => (
    <Text key={i} style={r.bold ? styles.bold : r.italics ? styles.italic : undefined}>{r.text}</Text>
  ))
}

function Block({ block }: { block: CvBlock }) {
  switch (block.kind) {
    case 'subheading':
      return <Text style={styles.subheading}>{inlineRuns(block.runs)}</Text>
    case 'bullet':
      return (
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{inlineRuns(block.runs)}</Text>
        </View>
      )
    case 'skill':
      return <Text style={styles.skill}><Text style={styles.bold}>{block.label}: </Text>{block.value}</Text>
    case 'para':
      return <Text style={styles.para}>{inlineRuns(block.runs)}</Text>
  }
}

export function CvPdfDoc({ model }: { model: CvModel }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {model.name ? <Text style={styles.name}>{model.name}</Text> : null}
        {model.contact ? <Text style={styles.contact}>{model.contact}</Text> : null}
        {model.intro.map((b, i) => <Block key={`intro-${i}`} block={b} />)}
        {model.sections.map((section, si) => (
          <View key={`sec-${si}`}>
            <Text style={styles.heading} minPresenceAhead={40}>{section.title}</Text>
            {section.blocks.map((b, i) => <Block key={`b-${si}-${i}`} block={b} />)}
          </View>
        ))}
      </Page>
    </Document>
  )
}

export async function buildCvPdfFromMarkdown(opts: { markdown: string; name?: string }): Promise<Buffer> {
  const model = parseCvMarkdown(opts.markdown, opts.name)
  return await renderToBuffer(<CvPdfDoc model={model} />)
}
