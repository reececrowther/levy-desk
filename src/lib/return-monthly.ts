import { findRule } from '@/levy/rules'
import { bookingMonthlyFigures, monthsInPeriod, sumByMonth, type MonthlyFigures } from '@/levy/monthly-figures'
import { returnMonth } from './return-period'

type BookingForMonthly = {
  bookedAt: Date
  firstPaymentAt: Date | null
  checkIn: Date
  checkOut: Date
  guestPaidGrossPence: number
  extrasPence: number
  property: { id: string; name: string }
  calculation: {
    nightsCharged: number
    basePence: number
    exclusionsPence: number
    working: unknown
  } | null
}

export type ReturnMonthly = {
  total: MonthlyFigures[]
  byProperty: { propertyId: string; propertyName: string; months: MonthlyFigures[] }[]
}

const iso = (d: Date) => d.toISOString().slice(0, 10)

/** Monthly figures for a return, in total and per property (each property may be filed separately). */
export function returnMonthlyFigures(
  council: string,
  periodStart: Date,
  periodEnd: Date,
  bookings: BookingForMonthly[],
): ReturnMonthly {
  const months = monthsInPeriod(periodStart, periodEnd)
  const rows = bookings
    .filter((b) => b.calculation)
    .map((b) => {
      const calc = b.calculation!
      const working = calc.working as { nightCapApplied?: boolean } | null
      return {
        property: b.property,
        figures: bookingMonthlyFigures(
          {
            month: returnMonth(council, b.checkIn, b.checkOut),
            bookedAt: iso(b.bookedAt),
            firstPaymentAt: b.firstPaymentAt ? iso(b.firstPaymentAt) : null,
            guestPaidGrossPence: b.guestPaidGrossPence,
            extrasPence: b.extrasPence,
            nightsCharged: calc.nightsCharged,
            basePence: calc.basePence,
            exclusionsPence: calc.exclusionsPence,
            nightCapApplied: working?.nightCapApplied === true,
          },
          findRule(council, iso(b.checkIn)),
        ),
      }
    })

  const propertyIds = [...new Set(rows.map((r) => r.property.id))]
  return {
    total: sumByMonth(rows.map((r) => r.figures), months),
    byProperty: propertyIds
      .map((id) => {
        const mine = rows.filter((r) => r.property.id === id)
        return {
          propertyId: id,
          propertyName: mine[0]!.property.name,
          months: sumByMonth(mine.map((r) => r.figures), months),
        }
      })
      .sort((a, b) => a.propertyName.localeCompare(b.propertyName)),
  }
}

export function monthLabel(month: string): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}
