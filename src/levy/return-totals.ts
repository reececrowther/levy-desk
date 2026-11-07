/**
 * Totals for a council levy return. Pure functions, integer pence only.
 *
 * VAT on the levy is NOT paid to the council. The levy counts as the provider's
 * turnover, so a VAT-registered provider accounts for VAT on it to HMRC on their
 * VAT return. Source: City of Edinburgh Council, "Edinburgh Visitor Levy Scheme:
 * Information for accommodation providers", v2.1 (Sept 2026), p.4 (VAT) and
 * p.12 (2% retention calculated on the levy due to the Council).
 */
export interface ReturnLine {
  levyPence: number
  vatOnLevyPence: number
  retentionPence: number
}

export interface ReturnTotals {
  totalLevyPence: number
  /** Informational: owed to HMRC, not the council */
  totalVatOnLevyPence: number
  totalRetentionPence: number
  /** Levy minus retention. Excludes VAT. */
  netPayablePence: number
}

export function netPayableToCouncil(levyPence: number, retentionPence: number): number {
  return levyPence - retentionPence
}

export function sumReturnTotals(lines: ReturnLine[]): ReturnTotals {
  let totalLevyPence = 0
  let totalVatOnLevyPence = 0
  let totalRetentionPence = 0
  for (const l of lines) {
    totalLevyPence += l.levyPence
    totalVatOnLevyPence += l.vatOnLevyPence
    totalRetentionPence += l.retentionPence
  }
  return {
    totalLevyPence,
    totalVatOnLevyPence,
    totalRetentionPence,
    netPayablePence: netPayableToCouncil(totalLevyPence, totalRetentionPence),
  }
}
