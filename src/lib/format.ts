/** Format integer pence as a GBP string: 1234 → "£12.34" */
export function formatPence(pence: number): string {
  const pounds = Math.trunc(pence / 100)
  const remainingPence = Math.abs(pence % 100)
  const sign = pence < 0 ? '-' : ''
  return `${sign}£${Math.abs(pounds).toLocaleString('en-GB')}.${String(remainingPence).padStart(2, '0')}`
}

/** Parse a GBP string or decimal string to integer pence */
export function parseToPence(value: string): number {
  const cleaned = value.replace(/[£,\s]/g, '')
  const num = parseFloat(cleaned)
  if (isNaN(num)) return 0
  return Math.round(num * 100)
}

/** Returns the quarter label for a date string YYYY-MM-DD */
export function quarterLabel(date: string): string {
  const month = parseInt(date.slice(5, 7), 10)
  const year = date.slice(0, 4)
  const q = Math.ceil(month / 3)
  return `Q${q} ${year}`
}

/** Returns the quarter start/end dates for a given date */
export function quarterBounds(date: string): { start: string; end: string } {
  const year = parseInt(date.slice(0, 4), 10)
  const month = parseInt(date.slice(5, 7), 10)
  const q = Math.ceil(month / 3)
  const startMonth = (q - 1) * 3 + 1
  const endMonth = q * 3
  const endDay = endMonth === 3 ? 31 : endMonth === 6 ? 30 : endMonth === 9 ? 30 : 31
  return {
    start: `${year}-${String(startMonth).padStart(2, '0')}-01`,
    end: `${year}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,
  }
}
