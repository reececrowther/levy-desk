import { formatPence } from '@/lib/format'
import type { Quarter } from '@/lib/quarters'
import { monthLabel, type ReturnMonthly } from '@/lib/return-monthly'
import type { MonthlyFigures } from '@/levy/monthly-figures'

export type ReturnRow = {
  property: string
  client: string
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
  monthly: ReturnMonthly
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
  lines.push(row(['VAT on levy (pay to HMRC, not the council)', formatPence(s.totalVatOnLevyPence)]))
  lines.push(row(['Retention (kept by host)', formatPence(s.totalRetentionPence)]))
  lines.push(row(['Net payable to council', formatPence(s.netPayablePence)]))
  lines.push('')

  // Monthly figures the portal asks for (Edinburgh guidance v2.1 p.14)
  lines.push(row(['MONTHLY FIGURES: enter these on visitorlevy.scot']))
  lines.push(row(['Stays are counted in the month the guest checked out, as for the quarter.']))
  lines.push(row(MONTHLY_HEADER))
  for (const m of s.monthly.total) lines.push(row(monthlyCells('All properties', m)))
  if (s.monthly.byProperty.length > 1) {
    lines.push('')
    lines.push(row(['MONTHLY FIGURES BY PROPERTY: use these if you file each property separately']))
    lines.push(row(MONTHLY_HEADER))
    for (const p of s.monthly.byProperty) {
      for (const m of p.months) lines.push(row(monthlyCells(p.propertyName, m)))
    }
  }
  lines.push('')

  // Appendix
  lines.push(row(['APPENDIX — per-booking detail']))
  lines.push(
    row([
      'Property',
      'Client',
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
        r.property,
        r.client,
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

const MONTHLY_HEADER = [
  'Property',
  'Month',
  'Total paid for accommodation only (£)',
  'Revenue from stays booked before the cut-off (£)',
  'Revenue from night 6 onwards (£)',
]

function monthlyCells(label: string, m: MonthlyFigures): string[] {
  return [
    label,
    monthLabel(m.month),
    formatPence(m.accommodationPence),
    formatPence(m.beforeCutOffPence),
    formatPence(m.beyondCapPence),
  ]
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
