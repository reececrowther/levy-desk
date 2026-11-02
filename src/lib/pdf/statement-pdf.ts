import PDFDocument from 'pdfkit'
import { formatPence } from '@/lib/format'
import { scotlandDeadline } from '@/lib/quarters'
import type { Quarter } from '@/lib/quarters'

const DARK = '#1a1a2e'
const MID = '#4a5568'
const LIGHT = '#718096'
const LINE = '#e2e8f0'
const ACCENT = '#2563eb'

export type StatementRow = {
  externalRef?: string | null
  checkIn: Date
  checkOut: Date
  nights: number
  adults: number
  under18s: number
  source: string
  guestPaidGrossPence: number
  levyPence: number
  retentionPence: number
}

export type StatementSummary = {
  workspaceName: string
  propertyName: string
  propertyAddress: string
  council: string
  country: string
  quarter: Quarter
  rows: StatementRow[]
  totalGrossPence: number
  totalLevyPence: number
  totalRetentionPence: number
  netPayablePence: number
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
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

export async function generateStatementPDF(s: StatementSummary): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W = doc.page.width - 100

    const council = councilLabel(s.council)
    const deadline = s.country === 'SCOTLAND' ? scotlandDeadline(s.quarter) : null

    // ── Header ────────────────────────────────────────────────────────────────

    doc
      .fillColor(DARK)
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Owner Statement', 50, 50)

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(MID)
      .text(`Property: ${s.propertyName}`, 50, 80)
      .text(`Address: ${s.propertyAddress}`, 50, 94)
      .text(`Council: ${council}`, 50, 108)
      .text(`Period: ${s.quarter.label} (${formatDate(s.quarter.periodStart)} to ${formatDate(s.quarter.periodEnd)})`, 50, 122)
      .text(`Prepared by: ${s.workspaceName}`, 50, 136)
      .text(`Generated: ${formatDate(new Date())}`, 50, 150)

    doc.moveTo(50, 170).lineTo(50 + W, 170).strokeColor(LINE).stroke()

    // ── Summary ───────────────────────────────────────────────────────────────

    let y = 186

    doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text('Summary', 50, y)
    y += 22

    const summaryRows: [string, string][] = [
      ['Confirmed bookings this quarter', String(s.rows.length)],
      ['Total guest-paid gross', formatPence(s.totalGrossPence)],
      ['Total visitor levy due', formatPence(s.totalLevyPence)],
      ['Retention kept by host (2%)', formatPence(s.totalRetentionPence)],
    ]

    for (const [label, value] of summaryRows) {
      doc.fillColor(LIGHT).fontSize(9).font('Helvetica').text(label, 50, y, { width: W - 100 })
      doc.fillColor(DARK).fontSize(9).font('Helvetica').text(value, 50 + W - 90, y, { width: 90, align: 'right' })
      y += 16
    }

    doc.moveTo(50, y).lineTo(50 + W, y).strokeColor(LINE).stroke()
    y += 10
    doc.fillColor(ACCENT).fontSize(11).font('Helvetica-Bold').text('Net levy payable to council', 50, y)
    doc.fillColor(ACCENT).fontSize(11).font('Helvetica-Bold').text(
      formatPence(s.netPayablePence), 50, y, { width: W, align: 'right' },
    )
    y += 18
    if (deadline) {
      doc
        .fillColor(LIGHT)
        .fontSize(9)
        .font('Helvetica')
        .text(`Filing deadline: ${formatDate(deadline)}`, 50, y)
    }
    y += 28

    doc.moveTo(50, y).lineTo(50 + W, y).strokeColor(LINE).stroke()
    y += 16

    // ── No-bookings note ──────────────────────────────────────────────────────

    if (s.rows.length === 0) {
      doc
        .fillColor(MID)
        .fontSize(10)
        .font('Helvetica-Oblique')
        .text('No confirmed bookings in this period.', 50, y)
      doc.moveTo(50, y + 24).lineTo(50 + W, y + 24).strokeColor(LINE).stroke()
      y += 40
    } else {
      // ── Booking table ─────────────────────────────────────────────────────

      doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text('Booking detail', 50, y)
      y += 20

      type ColAlign = 'left' | 'right'
      const cols: { x: number; w: number; label: string; align: ColAlign }[] = [
        { x: 50,  w: 60,  label: 'Ref',       align: 'left' },
        { x: 114, w: 56,  label: 'Check-in',  align: 'left' },
        { x: 174, w: 56,  label: 'Check-out', align: 'left' },
        { x: 234, w: 25,  label: 'Nts',       align: 'right' },
        { x: 262, w: 25,  label: 'Gsts',      align: 'right' },
        { x: 290, w: 65,  label: 'Gross',     align: 'right' },
        { x: 358, w: 60,  label: 'Levy',      align: 'right' },
        { x: 421, w: 60,  label: 'Retention', align: 'right' },
      ]

      for (const col of cols) {
        doc.fillColor(MID).fontSize(8).font('Helvetica-Bold').text(col.label, col.x, y, { width: col.w, align: col.align })
      }
      y += 14
      doc.moveTo(50, y).lineTo(50 + W, y).strokeColor(LINE).stroke()
      y += 6

      for (const r of s.rows) {
        if (y > doc.page.height - 100) {
          doc.addPage()
          y = 50
        }

        const guests = r.adults + r.under18s
        const cells = [
          r.externalRef ?? '—',
          r.checkIn.toISOString().slice(0, 10),
          r.checkOut.toISOString().slice(0, 10),
          String(r.nights),
          String(guests),
          formatPence(r.guestPaidGrossPence),
          formatPence(r.levyPence),
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

      // Totals row
      doc.moveTo(50, y).lineTo(50 + W, y).strokeColor(LINE).stroke()
      y += 6

      const totCells = [
        'Totals', '', '', '', '',
        formatPence(s.totalGrossPence),
        formatPence(s.totalLevyPence),
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
      y += 20
    }

    // ── Footer note ───────────────────────────────────────────────────────────

    doc
      .fillColor(LIGHT)
      .fontSize(8)
      .font('Helvetica-Oblique')
      .text(
        'This statement is for information only. Levy Desk does not file returns or make payments on your behalf.',
        50,
        y,
        { width: W },
      )

    doc.end()
  })
}
