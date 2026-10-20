import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export type ParseResult = {
  headers: string[]
  /** Normalised CSV text — store as ImportBatch.rawContent for re-parsing at process time */
  rawCsv: string
}

export function parseCSV(text: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  })
  const headers = (result.meta.fields ?? []).filter(Boolean)
  return { headers, rawCsv: text }
}

export function parseXLSX(buffer: ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheetName = wb.SheetNames[0]
  if (!sheetName) throw new Error('No sheets found in file')
  const sheet = wb.Sheets[sheetName]!

  // raw: false + dateNF causes Excel date serials to come out as YYYY-MM-DD strings
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    dateNF: 'yyyy-mm-dd',
    blankrows: false,
  }) as (string | number | null)[][]

  if (rows.length === 0) throw new Error('File contains no rows')

  const headerRow = rows[0] ?? []
  const dataRows = rows.slice(1)

  const headers = headerRow
    .map((h) => String(h ?? '').trim())
    .filter(Boolean)

  const normalisedRows = dataRows.map((row) =>
    headers.map((_, i) => String(row[i] ?? '').trim()),
  )

  // Reconstruct as CSV for consistent storage
  const rawCsv = Papa.unparse([headers, ...normalisedRows])

  return { headers, rawCsv }
}

export function parseFile(buffer: ArrayBuffer, filename: string): ParseResult {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    return parseXLSX(buffer)
  }
  const text = new TextDecoder('utf-8').decode(buffer)
  return parseCSV(text)
}
