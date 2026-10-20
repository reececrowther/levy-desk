import PDFDocument from 'pdfkit'
import { formatPence } from '@/lib/format'
import type { ReturnSummary } from '@/lib/csv/return-csv'

const DARK = '#1a1a2e'
const MID = '#4a5568'
const LIGHT = '#718096'
const LINE = '#e2e8f0'
const ACCENT = '#2563eb'

export async function generateReturnPDF(s: ReturnSummary): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W = doc.page.width - 100 // usable width

    // ── Cover / header ────────────────────────────────────────────────────────

    doc
      .fillColor(DARK)
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Visitor Levy Return', 50, 50)

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(MID)
      .text(`${councilLabel(s.council)}`, 50, 80)
      .text(`Period: ${s.quarter.label} (${formatDate(s.quarter.periodStart)} to ${formatDate(s.quarter.periodEnd)})`, 50, 94)
      .text(`Workspace: ${s.workspaceName}`, 50, 108)
      .text(`Generated: ${formatDate(new Date())}`, 50, 122)

    // Horizontal rule
    doc.moveTo(50, 142).lineTo(50 + W, 142).strokeColor(LINE).stroke()

    // ── Summary table ─────────────────────────────────────────────────────────

    let y = 158

    doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text('Summary', 50, y)
    y += 22

    const summaryRows: [string, string][] = [
      ['Total nights charged', String(s.totalNightsCharged)],
      ['Levy base (accommodation gross minus exclusions)', formatPence(s.totalBasePence)],
      ['Levy due', formatPence(s.totalLevyPence)],
      ['VAT on levy (20%, VAT-registered hosts only)', formatPence(s.totalVatOnLevyPence)],
      ['Retention kept by host', formatPence(s.totalRetentionPence)],
    ]

    for (const [label, value] of summaryRows) {
      doc.fillColor(LIGHT).fontSize(9).font('Helvetica').text(label, 50, y, { width: W - 100 })
      doc.fillColor(DARK).fontSize(9).font('Helvetica').text(value, 50 + W - 90, y, { width: 90, align: 'right' })
      y += 16
    }

    // Net payable — highlighted
    doc.moveTo(50, y).lineTo(50 + W, y).strokeColor(LINE).stroke()
    y += 10
    doc.fillColor(ACCENT).fontSize(11).font('Helvetica-Bold').text('Net payable to council', 50, y)
    doc.fillColor(ACCENT).fontSize(11).font('Helvetica-Bold').text(formatPence(s.netPayablePence), 50, y, { width: W, align: 'right' })
    y += 28

    doc.moveTo(50, y).lineTo(50 + W, y).strokeColor(LINE).stroke()
    y += 16

    // ── No-bookings note ──────────────────────────────────────────────────────

    if (s.rows.length === 0) {
      doc
        .fillColor(MID)
        .fontSize(10)
        .font('Helvetica-Oblique')
        .text('No confirmed bookings in this period. This is a nil return.', 50, y)
      doc.end()
      return
    }

    // ── Appendix ──────────────────────────────────────────────────────────────

    doc.addPage()
    y = 50

    doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text('Appendix — per-booking detail', 50, y)
    y += 20

    // Column definitions (x offset, width, label, alignment)
    type ColAlign = 'left' | 'right'
    const cols: { x: number; w: number; label: string; align: ColAlign }[] = [
      { x: 50,  w: 70,  label: 'Ref',       align: 'left' },
      { x: 125, w: 56,  label: 'Check-in',  align: 'left' },
      { x: 185, w: 56,  label: 'Check-out', align: 'left' },
      { x: 245, w: 30,  label: 'Nts',       align: 'right' },
      { x: 278, w: 60,  label: 'Base',      align: 'right' },
      { x: 341, w: 60,  label: 'Levy',      align: 'right' },
      { x: 404, w: 60,  label: 'VAT',       align: 'right' },
      { x: 467, w: 60,  label: 'Ret.',      align: 'right' },
    ]

    // Table header
    for (const col of cols) {
      doc.fillColor(MID).fontSize(8).font('Helvetica-Bold').text(col.label, col.x, y, { width: col.w, align: col.align })
    }
    y += 14
    doc.moveTo(50, y).lineTo(50 + W, y).strokeColor(LINE).stroke()
    y += 6

    for (const r of s.rows) {
      if (y > doc.page.height - 80) {
        doc.addPage()
        y = 50
      }

      const cells = [
        r.externalRef ?? '—',
        r.checkIn.toISOString().slice(0, 10),
        r.checkOut.toISOString().slice(0, 10),
        String(r.nights),
        formatPence(r.basePence),
        formatPence(r.levyPence),
        formatPence(r.vatOnLevyPence),
        formatPence(r.retentionPence),
      ]

      for (let i = 0; i < cols.length; i++) {
        const col = cols[i]!
        doc
          .fillColor(DARK)
          .fontSize(7.5)
          .font('Helvetica')
          .text(cells[i] ?? '', col.x, y, { width: col.w, align: col.align })
      }

      y += 13
    }

    // Footer totals row
    doc.moveTo(50, y).lineTo(50 + W, y).strokeColor(LINE).stroke()
    y += 6

    const totCells = [
      'Totals', '', '', '',
      formatPence(s.totalBasePence),
      formatPence(s.totalLevyPence),
      formatPence(s.totalVatOnLevyPence),
      formatPence(s.totalRetentionPence),
    ]
    for (let i = 0; i < cols.length; i++) {
      const col = cols[i]!
      doc
        .fillColor(DARK)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text(totCells[i] ?? '', col.x, y, { width: col.w, align: col.align })
    }

    doc.end()
  })
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function councilLabel(slug: string): string {
  const MAP: Record<string, string> = {
    edinburgh: 'City of Edinburgh Council',
    glasgow: 'Glasgow City Council',
    aberdeen: 'Aberdeen City Council',
    stirling: 'Stirling Council',
    west_dunbartonshire: 'West Dunbartonshire Council',
    highland: 'Highland Council',
    cardiff: 'Cardiff Council',
  }
  return MAP[slug] ?? slug.replace(/_/g, ' ')
}
