/**
 * Monthly figures for the quarterly return on visitorlevy.scot. Pure, integer pence.
 *
 * Edinburgh guidance v2.1 p.14: returns are quarterly, but these must be given for
 * each month:
 *  - total paid by customers for accommodation only (no levy included)
 *  - revenue from stays booked (and paid in part or full) before 1 October 2025
 *  - revenue from the 6th night onwards, excluding stays booked before the cut-off
 */
import type { SchemeRule } from './types'

export interface MonthlyBooking {
  /** YYYY-MM the booking is reported in (see returnMonth in lib/return-period) */
  month: string
  bookedAt: string
  firstPaymentAt?: string | null
  guestPaidGrossPence: number
  extrasPence: number
  nightsCharged: number
  basePence: number
  exclusionsPence: number
  nightCapApplied: boolean
}

export interface MonthlyFigures {
  month: string
  accommodationPence: number
  beforeCutOffPence: number
  beyondCapPence: number
}

/** Mirrors the calculator's cut-off test, so a booking exempted there is counted here. */
export function bookedBeforeCutOff(
  rule: Pick<SchemeRule, 'bookingCutOffDate' | 'bookingCutOffBasis'> | undefined,
  bookedAt: string,
  firstPaymentAt?: string | null,
): boolean {
  if (!rule?.bookingCutOffDate) return false
  if (rule.bookingCutOffBasis === 'booking_date') return bookedAt < rule.bookingCutOffDate
  return !!firstPaymentAt && firstPaymentAt < rule.bookingCutOffDate
}

export function bookingMonthlyFigures(
  b: MonthlyBooking,
  rule: Pick<SchemeRule, 'bookingCutOffDate' | 'bookingCutOffBasis'> | undefined,
): MonthlyFigures {
  // Charged bookings record extras plus any breakfast deduction; zero-levy ones record nothing.
  const accommodationPence = b.guestPaidGrossPence - (b.nightsCharged > 0 ? b.exclusionsPence : b.extrasPence)
  const beforeCutOff = bookedBeforeCutOff(rule, b.bookedAt, b.firstPaymentAt)
  const beyondCapPence =
    !beforeCutOff && b.nightsCharged > 0 && b.nightCapApplied ? Math.max(0, accommodationPence - b.basePence) : 0
  return {
    month: b.month,
    accommodationPence,
    beforeCutOffPence: beforeCutOff ? accommodationPence : 0,
    beyondCapPence,
  }
}

/** One row per month in `months` (zeros included, as the return asks for every month). */
export function sumByMonth(rows: MonthlyFigures[], months: string[]): MonthlyFigures[] {
  return months.map((month) => {
    const total: MonthlyFigures = { month, accommodationPence: 0, beforeCutOffPence: 0, beyondCapPence: 0 }
    for (const r of rows) {
      if (r.month !== month) continue
      total.accommodationPence += r.accommodationPence
      total.beforeCutOffPence += r.beforeCutOffPence
      total.beyondCapPence += r.beyondCapPence
    }
    return total
  })
}

/** YYYY-MM for each month from periodStart to periodEnd inclusive. */
export function monthsInPeriod(periodStart: Date, periodEnd: Date): string[] {
  const months: string[] = []
  const d = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth(), 1))
  while (d.getTime() <= periodEnd.getTime()) {
    months.push(d.toISOString().slice(0, 7))
    d.setUTCMonth(d.getUTCMonth() + 1)
  }
  return months
}
