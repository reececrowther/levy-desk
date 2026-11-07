/**
 * Tests from Glasgow City Council's "Glasgow Visitor Levy Scheme: User Guide for
 * Accommodation Providers" (October 2025) and the City Administration Committee
 * report (19 June 2025).
 * https://www.glasgow.gov.uk/article/14799/Glasgow-s-Visitor-Levy
 */
import { describe, it, expect } from 'vitest'
import { calculate } from '../calculator'
import { SCHEME_RULES } from '../rules/index'
import { Flag } from '../flags'
import { excludeVat } from '../vat'
import { sumReturnTotals } from '../return-totals'
import type { Booking, Property } from '../types'

const flat: Property = {
  id: 'prop-gla-guidance',
  name: 'Glasgow guidance flat',
  council: 'glasgow',
  country: 'scotland',
  accommodationType: 'self_catering',
  unitsOrRooms: 1,
  vatRegistered: false,
  breakfastIncluded: false,
}

function booking(overrides: Partial<Booking> & { checkIn: string; checkOut: string }): Booking {
  return {
    id: 'bk-gla',
    source: 'airbnb',
    bookedAt: '2026-06-01',
    firstPaymentAt: '2026-06-01',
    adults: 2,
    under18s: 0,
    guestPaidGrossPence: 0,
    extrasPence: 0,
    currency: 'GBP',
    status: 'confirmed',
    ...overrides,
  }
}

const calc = (b: Booking, p: Property = flat) => calculate(b, p, { rules: SCHEME_RULES })

describe('Start date: 25 January 2027 (council web page and user guide)', () => {
  it('a stay 10–12 January 2027 is not liable', () => {
    expect(calc(booking({ checkIn: '2027-01-10', checkOut: '2027-01-12', guestPaidGrossPence: 20_000 })).levyPence).toBe(0)
  })
  it('a stay from 25 January 2027 is liable at 5%', () => {
    const r = calc(booking({ checkIn: '2027-01-25', checkOut: '2027-01-27', guestPaidGrossPence: 20_000 }))
    expect(r.schemeRuleId).toBe('glasgow-v1')
    expect(r.levyPence).toBe(1_000)
  })
  it('a stay spanning the start (23–27 Jan) charges nights from 25 Jan and is flagged', () => {
    const r = calc(booking({ checkIn: '2027-01-23', checkOut: '2027-01-27', guestPaidGrossPence: 40_000 }))
    expect(r.nightsCharged).toBe(2)
    expect(r.levyPence).toBe(1_000)
    expect(r.flags).toContain(Flag.PRE_START_STAY_UNCLEAR)
  })
})

describe('No night cap: "The levy will apply for the entire duration of the stay"', () => {
  it('14 nights at £100 → £70.00', () => {
    const r = calc(booking({ checkIn: '2027-03-01', checkOut: '2027-03-15', guestPaidGrossPence: 140_000 }))
    expect(r.nightsCharged).toBe(14)
    expect(r.levyPence).toBe(7_000)
  })
})

describe('Cut-off: "advance bookings made before the 1 April 2026 are out of scope"', () => {
  it('booked 31 March 2026 for a February 2027 stay → £0', () => {
    expect(
      calc(booking({ bookedAt: '2026-03-31', firstPaymentAt: undefined, checkIn: '2027-02-01', checkOut: '2027-02-03', guestPaidGrossPence: 20_000 })).levyPence,
    ).toBe(0)
  })
  it('booked 1 April 2026 → liable, and no payment-date flag (Glasgow tests the booking date)', () => {
    const r = calc(booking({ bookedAt: '2026-04-01', firstPaymentAt: undefined, checkIn: '2027-02-01', checkOut: '2027-02-03', guestPaidGrossPence: 20_000 }))
    expect(r.levyPence).toBe(1_000)
    expect(r.flags).not.toContain(Flag.PAYMENT_DATE_UNKNOWN)
  })
})

describe('Retention 1.5%: "£5,000 ... £75 would be retained ... £4925 would be due"', () => {
  it('£5,000 of levy → keep £75, pay £4,925', () => {
    // 20 bookings of £5,000 accommodation each → £250 levy each → £5,000 total
    const lines = Array.from({ length: 20 }, () =>
      calc(booking({ checkIn: '2027-02-01', checkOut: '2027-02-03', guestPaidGrossPence: 500_000 })),
    )
    const t = sumReturnTotals(lines)
    expect(t.totalLevyPence).toBe(500_000)
    expect(t.totalRetentionPence).toBe(7_500)
    expect(t.netPayablePence).toBe(492_500)
  })
})

describe('User guide VAT example: VAT-registered hotel, £120 room incl. VAT', () => {
  it('levy is 5% of £100 net = £5.00 to the council; VAT on the levy (£1.00) goes to HMRC', () => {
    const r = calc(
      booking({ checkIn: '2027-02-01', checkOut: '2027-02-02', guestPaidGrossPence: excludeVat(12_000) }),
      { ...flat, accommodationType: 'hotel', vatRegistered: true },
    )
    expect(r.levyPence).toBe(500)
    expect(r.vatOnLevyPence).toBe(100)
  })
})
