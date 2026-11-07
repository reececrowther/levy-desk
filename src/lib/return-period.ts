/**
 * Which return period a booking belongs to.
 *
 * Scotland (Edinburgh guidance v2.1 p.13): "Where a stay commences in one quarter and
 * finishes in the next, it should be included in the levy return for the quarter when
 * the visitor checked out." Assumed for all Scottish councils (same national portal);
 * UNVERIFIED outside Edinburgh. Wales: check-in basis (UNVERIFIED).
 *
 * Transition: Levy Desk used the check-in basis for the first Edinburgh period
 * (24 Jul – 30 Sep 2026), whose returns were due by 30 Oct 2026. To avoid reporting
 * a stay twice, bookings that checked in before CHECK_OUT_BASIS_FROM stay in the
 * check-in quarter; the check-out basis applies to stays checking in from that date.
 */
import type { Prisma } from '@prisma/client'
import { SCHEME_RULES } from '../levy/rules/index'

export const CHECK_OUT_BASIS_FROM = new Date(Date.UTC(2026, 9, 1)) // 1 October 2026

export function usesCheckOutBasis(council: string): boolean {
  return SCHEME_RULES.some((r) => r.council === council && r.country === 'scotland')
}

/** Pure check: does a booking belong to the period [periodStart, periodEnd]? */
export function bookingInPeriod(
  council: string,
  checkIn: Date,
  checkOut: Date,
  periodStart: Date,
  periodEnd: Date,
): boolean {
  const within = (d: Date) => d.getTime() >= periodStart.getTime() && d.getTime() <= periodEnd.getTime()
  if (usesCheckOutBasis(council) && checkIn.getTime() >= CHECK_OUT_BASIS_FROM.getTime()) {
    return within(checkOut)
  }
  return within(checkIn)
}

/** Prisma filter equivalent of bookingInPeriod for a single council. */
export function bookingPeriodWhere(
  council: string,
  periodStart: Date,
  periodEnd: Date,
): Prisma.BookingWhereInput {
  const range = { gte: periodStart, lte: periodEnd }
  if (!usesCheckOutBasis(council)) return { checkIn: range }
  return {
    OR: [
      { checkIn: { gte: CHECK_OUT_BASIS_FROM }, checkOut: range },
      { checkIn: { ...range, lt: CHECK_OUT_BASIS_FROM } },
    ],
  }
}

/** Broad filter for multi-council queries: any booking that could belong to the period. Filter with bookingInPeriod afterwards. */
export function bookingOverlapsPeriodWhere(periodStart: Date, periodEnd: Date): Prisma.BookingWhereInput {
  return { checkIn: { lte: periodEnd }, checkOut: { gte: periodStart } }
}
