import { describe, it, expect } from 'vitest'
import { bookingMonthlyFigures, monthsInPeriod, sumByMonth, type MonthlyBooking } from '../monthly-figures'
import { findRule } from '../rules'
import { calculate } from '../calculator'
import { SCHEME_RULES } from '../rules'
import { returnMonth } from '../../lib/return-period'

const d = (s: string) => new Date(`${s}T00:00:00Z`)
const edinburgh = findRule('edinburgh', '2026-11-01')

const base: MonthlyBooking = {
  month: '2026-11',
  bookedAt: '2026-10-15',
  firstPaymentAt: '2026-10-15',
  guestPaidGrossPence: 50_000,
  extrasPence: 0,
  nightsCharged: 4,
  basePence: 50_000,
  exclusionsPence: 0,
  nightCapApplied: false,
}

describe('Edinburgh monthly return figures (guidance v2.1 p.14)', () => {
  it('a short stay counts in full as accommodation revenue, nothing else', () => {
    expect(bookingMonthlyFigures(base, edinburgh)).toEqual({
      month: '2026-11', accommodationPence: 50_000, beforeCutOffPence: 0, beyondCapPence: 0,
    })
  })

  it('extras are left out of accommodation-only revenue', () => {
    const f = bookingMonthlyFigures({ ...base, guestPaidGrossPence: 55_000, extrasPence: 5_000, exclusionsPence: 5_000 }, edinburgh)
    expect(f.accommodationPence).toBe(50_000)
  })

  it('a booking paid before 1 Oct 2025 counts in accommodation and before-cut-off revenue, not night 6+', () => {
    const f = bookingMonthlyFigures(
      { ...base, bookedAt: '2025-08-01', firstPaymentAt: '2025-08-01', nightsCharged: 0, basePence: 0, nightCapApplied: false },
      edinburgh,
    )
    expect(f).toEqual({ month: '2026-11', accommodationPence: 50_000, beforeCutOffPence: 50_000, beyondCapPence: 0 })
  })

  it('booked early but no payment date: charged, so not counted as before the cut-off', () => {
    const f = bookingMonthlyFigures({ ...base, bookedAt: '2025-08-01', firstPaymentAt: null }, edinburgh)
    expect(f.beforeCutOffPence).toBe(0)
  })

  it('matches the calculator for a 10-night stay: nights 6 to 10 are the night-6-onwards revenue', () => {
    const calc = calculate(
      {
        id: 'b', source: 'airbnb', bookedAt: '2026-10-01', firstPaymentAt: '2026-10-01',
        checkIn: '2026-11-01', checkOut: '2026-11-11', adults: 2, under18s: 0,
        guestPaidGrossPence: 100_000, extrasPence: 0, currency: 'GBP', status: 'confirmed',
      },
      {
        id: 'p', name: 'Flat', council: 'edinburgh', country: 'scotland', accommodationType: 'self_catering',
        unitsOrRooms: 1, vatRegistered: false, breakfastIncluded: false,
      },
      { rules: SCHEME_RULES },
    )
    const f = bookingMonthlyFigures(
      {
        ...base,
        guestPaidGrossPence: 100_000,
        nightsCharged: calc.nightsCharged,
        basePence: calc.basePence,
        exclusionsPence: calc.exclusionsPence,
        nightCapApplied: calc.working.nightCapApplied,
      },
      edinburgh,
    )
    expect(calc.basePence).toBe(50_000)
    expect(f).toEqual({ month: '2026-11', accommodationPence: 100_000, beforeCutOffPence: 0, beyondCapPence: 50_000 })
  })
})

describe('Glasgow uses the booking date for its cut-off', () => {
  const glasgow = findRule('glasgow', '2027-02-01')
  it('booked before 1 Apr 2026 counts as before the cut-off, whatever the payment date', () => {
    const f = bookingMonthlyFigures({ ...base, bookedAt: '2026-03-01', firstPaymentAt: null, nightsCharged: 0, basePence: 0 }, glasgow)
    expect(f.beforeCutOffPence).toBe(50_000)
  })
})

describe('months and totals', () => {
  it('Q4 2026 has October, November and December', () => {
    expect(monthsInPeriod(d('2026-10-01'), d('2026-12-31'))).toEqual(['2026-10', '2026-11', '2026-12'])
  })

  it('every month appears, with zeros where there were no stays, and totals add up', () => {
    const rows = [
      bookingMonthlyFigures({ ...base, month: '2026-10' }, edinburgh),
      bookingMonthlyFigures({ ...base, month: '2026-10', guestPaidGrossPence: 1_000, basePence: 1_000 }, edinburgh),
    ]
    const months = sumByMonth(rows, ['2026-10', '2026-11', '2026-12'])
    expect(months.map((m) => m.accommodationPence)).toEqual([51_000, 0, 0])
  })

  it('a stay crossing a month end counts in the check-out month, like the quarter', () => {
    expect(returnMonth('edinburgh', d('2026-11-29'), d('2026-12-02'))).toBe('2026-12')
  })

  it('transition: a stay checking in before 1 Oct 2026 keeps its check-in month', () => {
    expect(returnMonth('edinburgh', d('2026-09-28'), d('2026-10-03'))).toBe('2026-09')
  })

  it('Wales keeps the check-in month', () => {
    expect(returnMonth('cardiff', d('2027-06-29'), d('2027-07-02'))).toBe('2027-06')
  })
})
