import { z } from 'zod'
import { Flag } from '@/levy/flags'
import type { TargetField } from './presets'

export type ValidatedRow = {
  externalRef?: string
  bookedAt: string
  firstPaymentAt?: string
  checkIn: string
  checkOut: string
  adults: number
  under18s: number
  guestPaidGrossPence: number
  extrasPence: number
  commissionPence?: number
  payoutPence?: number
  status: 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'
  flags: string[]
}

export type RowValidationResult =
  | { ok: true; data: ValidatedRow }
  | { ok: false; errors: string[] }

// ─── Date helpers ─────────────────────────────────────────────────────────────

const MONTH_ABBR: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

function toISODate(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null

  // YYYY-MM-DD or YYYY/MM/DD
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (m) return pad(m[1]!, m[2]!, m[3]!)

  // DD/MM/YYYY or DD-MM-YYYY (UK default)
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (m) return pad(m[3]!, m[2]!, m[1]!)

  // DD/MM/YY
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2})$/)
  if (m) return pad(`20${m[3]}`, m[2]!, m[1]!)

  // "Jul 24, 2026" (Airbnb)
  m = s.match(/^([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})$/)
  if (m) {
    const mo = MONTH_ABBR[m[1]!.toLowerCase()]
    if (mo) return pad(m[3]!, String(mo), m[2]!)
  }

  // "24 Jul 2026"
  m = s.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/)
  if (m) {
    const mo = MONTH_ABBR[m[2]!.toLowerCase()]
    if (mo) return pad(m[3]!, String(mo), m[1]!)
  }

  return null
}

function pad(year: string, month: string, day: string): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// ─── Currency helpers ──────────────────────────────────────────────────────────

function parseCurrencyToPence(raw: string): number | null {
  if (!raw.trim()) return null
  // Strip currency symbols, spaces; handle (negative) and - negative
  const cleaned = raw.replace(/[£$€\s]/g, '').replace(/,/g, '')
  const negative = cleaned.startsWith('(') && cleaned.endsWith(')')
  const num = parseFloat(negative ? cleaned.slice(1, -1) : cleaned)
  if (isNaN(num)) return null
  return Math.round((negative ? -num : num) * 100)
}

// ─── Status mapping ────────────────────────────────────────────────────────────

function parseStatus(raw: string): 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' {
  const s = raw.trim().toLowerCase()
  if (s.includes('cancel')) return 'CANCELLED'
  if (s.includes('no_show') || s.includes('no show') || s === 'noshow') return 'NO_SHOW'
  return 'CONFIRMED'
}

// ─── Zod schema ────────────────────────────────────────────────────────────────

const RawRowSchema = z.object({
  externalRef: z.string().optional(),
  bookedAt: z.string().optional(),
  firstPaymentAt: z.string().optional(),
  checkIn: z.string(),
  checkOut: z.string(),
  adults: z.string().optional(),
  under18s: z.string().optional(),
  guestPaidGross: z.string().optional(),
  extras: z.string().optional(),
  commission: z.string().optional(),
  payout: z.string().optional(),
  status: z.string().optional(),
})

// ─── Main validator ────────────────────────────────────────────────────────────

export function validateRow(
  mapped: Partial<Record<TargetField, string>>,
  council?: string,
  country?: string,
): RowValidationResult {
  const parsed = RawRowSchema.safeParse(mapped)
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((e: { message: string }) => e.message),
    }
  }

  const raw = parsed.data
  const errors: string[] = []
  const flags: string[] = []

  // Required date fields
  const checkIn = toISODate(raw.checkIn)
  if (!checkIn) errors.push(`Check-in date "${raw.checkIn}" could not be parsed — try YYYY-MM-DD or DD/MM/YYYY`)

  const checkOut = toISODate(raw.checkOut)
  if (!checkOut) errors.push(`Check-out date "${raw.checkOut}" could not be parsed — try YYYY-MM-DD or DD/MM/YYYY`)

  if (checkIn && checkOut && checkOut <= checkIn) {
    errors.push(`Check-out (${checkOut}) must be after check-in (${checkIn})`)
  }

  if (errors.length > 0) return { ok: false, errors }

  // Optional date fields
  const bookedAt = toISODate(raw.bookedAt ?? '') ?? checkIn!
  const firstPaymentAt = raw.firstPaymentAt ? toISODate(raw.firstPaymentAt) ?? undefined : undefined

  // Adults — missing is soft; flag for Welsh if needed
  let adults = raw.adults ? parseInt(raw.adults, 10) : NaN
  if (isNaN(adults) || adults < 0) {
    adults = 1
    if (country?.toLowerCase() === 'wales') {
      flags.push(Flag.WELSH_GUEST_COUNT_MISSING)
    }
  }

  const under18s = raw.under18s ? Math.max(0, parseInt(raw.under18s, 10)) : 0

  // Money — missing guestPaidGross is soft; use payout as fallback with flag
  let guestPaidGrossPence = parseCurrencyToPence(raw.guestPaidGross ?? '')
  const payoutPence = parseCurrencyToPence(raw.payout ?? '')

  if (guestPaidGrossPence === null) {
    if (payoutPence !== null) {
      guestPaidGrossPence = payoutPence
      flags.push(Flag.BASE_IS_PAYOUT_NOT_GROSS)
    } else {
      guestPaidGrossPence = 0
      flags.push(Flag.BASE_IS_PAYOUT_NOT_GROSS)
    }
  }

  const extrasPence = parseCurrencyToPence(raw.extras ?? '') ?? 0
  const commissionPence = parseCurrencyToPence(raw.commission ?? '') ?? undefined

  const status = parseStatus(raw.status ?? 'confirmed')

  return {
    ok: true,
    data: {
      externalRef: raw.externalRef || undefined,
      bookedAt,
      firstPaymentAt,
      checkIn: checkIn!,
      checkOut: checkOut!,
      adults,
      under18s,
      guestPaidGrossPence: Math.max(0, guestPaidGrossPence),
      extrasPence,
      commissionPence: commissionPence !== undefined ? Math.max(0, commissionPence) : undefined,
      payoutPence: payoutPence !== null ? Math.max(0, payoutPence) : undefined,
      status,
      flags,
    },
  }
}
