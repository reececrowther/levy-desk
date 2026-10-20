/** Quarter utilities — Scotland uses calendar quarters (Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec) */

export type Quarter = {
  label: string    // e.g. "Q3 2026"
  key: string      // e.g. "2026-Q3"
  periodStart: Date
  periodEnd: Date
}

export function parseQuarterKey(key: string): Quarter {
  const [year, qPart] = key.split('-')
  const q = parseInt(qPart!.replace('Q', ''), 10)
  if (q < 1 || q > 4) throw new Error(`Invalid quarter: ${key}`)
  const monthStart = (q - 1) * 3
  const periodStart = new Date(Date.UTC(parseInt(year!), monthStart, 1))
  // Last day of the last month of the quarter
  const periodEnd = new Date(Date.UTC(parseInt(year!), monthStart + 3, 0, 23, 59, 59))
  return { label: `Q${q} ${year}`, key, periodStart, periodEnd }
}

export function dateToQuarterKey(date: Date): string {
  const q = Math.floor(date.getUTCMonth() / 3) + 1
  return `${date.getUTCFullYear()}-Q${q}`
}

/** Deadline for Scotland: end of the month following the quarter end */
export function scotlandDeadline(quarter: Quarter): Date {
  const qEnd = quarter.periodEnd
  // First day of the month after quarter end + 1 month = last day of that month
  const month = qEnd.getUTCMonth() + 2 // +1 for next month, +1 for 1-indexed → +2
  const year = qEnd.getUTCFullYear() + (month > 11 ? 1 : 0)
  return new Date(Date.UTC(year, month % 12 + 1, 0))
}

/**
 * All filing quarters from earliestDate up to and including today's quarter.
 * Returns most recent first.
 */
export function availableQuarters(earliestDateStr: string): Quarter[] {
  const earliest = new Date(earliestDateStr)
  const today = new Date()
  const quarters: Quarter[] = []

  // Start from the first day of the quarter containing earliestDate
  const firstQ = Math.floor(earliest.getUTCMonth() / 3)
  let cursor = new Date(Date.UTC(earliest.getUTCFullYear(), firstQ * 3, 1))

  const todayKey = dateToQuarterKey(today)

  while (true) {
    const key = `${cursor.getUTCFullYear()}-Q${Math.floor(cursor.getUTCMonth() / 3) + 1}`
    quarters.push(parseQuarterKey(key))
    if (key === todayKey) break
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 3, 1))
    // Safety guard
    if (cursor.getUTCFullYear() > today.getUTCFullYear() + 1) break
  }

  return quarters.reverse()
}

/** Human-readable quarter period, e.g. "1 July 2026 to 30 September 2026" */
export function formatQuarterPeriod(q: Quarter): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
  return `${fmt(q.periodStart)} to ${fmt(q.periodEnd)}`
}
