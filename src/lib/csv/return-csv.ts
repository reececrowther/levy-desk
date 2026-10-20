import { formatPence } from '@/lib/format'
import type { Quarter } from '@/lib/quarters'

export type ReturnRow = {
  externalRef: string | null
  checkIn: Date
  checkOut: Date
  nights: number
  adults: number
  under18s: number
  source: string
  basePence: number
  exclusionsPence: number
  levyPence: number
  vatOnLevyPence: number
  retentionPence: number
  schemeRuleId: string
  flags: string[]
}

export type ReturnSummary = {
  workspaceName: string
  council: string
  quarter: Quarter
  totalNightsCharged: number
  totalBasePence: number
  totalExclusionsPence: number
  totalLevyPence: number
  totalVatOnLevyPence: number
  totalRetentionPence: number
  netPayablePence: number
  rows: ReturnRow[]
}

function esc(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

function row(cells: (string | number)[]): string {
  return cells.map((c) => esc(String(c))).join(',')
}

export function generateReturnCSV(s: ReturnSummary): string {
  const lines: string[] = []

  // Header block
  lines.push(row(['Visitor Levy Return']))
  lines.push(row(['Council', councilLabel(s.council)]))
  lines.push(row(['Period', s.quarter.label]))
  lines.push(row(['Period start', s.quarter.periodStart.toISOString().slice(0, 10)]))
  lines.push(row(['Period end', s.quarter.periodEnd.toISOString().slice(0, 10)]))
  lines.push(row(['Workspace', s.workspaceName]))
  lines.push(row(['Generated', new Date().toISOString().slice(0, 10)]))
  lines.push('')

  // Summary
  lines.push(row(['SUMMARY']))
  lines.push(row(['Total nights charged', s.totalNightsCharged]))
  lines.push(row(['Total levy base', formatPence(s.totalBasePence)]))
  lines.push(row(['Total levy due', formatPence(s.totalLevyPence)]))
  lines.push(row(['VAT on levy (if registered)', formatPence(s.totalVatOnLevyPence)]))
  lines.push(row(['Retention (kept by host)', formatPence(s.totalRetentionPence)]))
  lines.push(row(['Net payable to council', formatPence(s.netPayablePence)]))
  lines.push('')

  // Appendix
  lines.push(row(['APPENDIX — per-booking detail']))
  lines.push(
    row([
      'Ref',
      'Check-in',
      'Check-out',
      'Nights charged',
      'Adults',
      'Under-18s',
      'Source',
      'Levy base (£)',
      'Exclusions (£)',
      'Levy due (£)',
      'VAT on levy (£)',
      'Retention (£)',
      'Rule version',
      'Flags',
    ]),
  )

  for (const r of s.rows) {
    lines.push(
      row([
        r.externalRef ?? '',
        r.checkIn.toISOString().slice(0, 10),
        r.checkOut.toISOString().slice(0, 10),
        r.nights,
        r.adults,
        r.under18s,
        r.source,
        formatPence(r.basePence),
        formatPence(r.exclusionsPence),
        formatPence(r.levyPence),
        formatPence(r.vatOnLevyPence),
        formatPence(r.retentionPence),
        r.schemeRuleId,
        r.flags.join(' | '),
      ]),
    )
  }

  return lines.join('\r\n')
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
