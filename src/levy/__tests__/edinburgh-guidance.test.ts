/**
 * Tests taken from the City of Edinburgh Council's official guidance:
 * "Edinburgh Visitor Levy Scheme: Information for accommodation providers",
 * Version 2.1, September 2026.
 * https://www.edinburgh.gov.uk/downloads/file/40692/edinburgh-visitor-levy-scheme-information-for-accommodation-providers
 *
 * Page numbers refer to that document.
 */
import { describe, it, expect } from 'vitest'
import { calculate } from '../calculator'
import { SCHEME_RULES } from '../rules/index'
import { Flag } from '../flags'
import { sumReturnTotals, netPayableToCouncil } from '../return-totals'
import { getPreset } from '../../lib/importers/presets'
import type { Booking, Property } from '../types'

const flat: Property = {
  id: 'prop-edin-guidance',
  name: 'Guidance test flat',
  council: 'edinburgh',
  country: 'scotland',
  accommodationType: 'self_catering',
  unitsOrRooms: 1,
  vatRegistered: false,
  breakfastIncluded: false,
}

function booking(overrides: Partial<Booking> & { checkIn: string; checkOut: string }): Booking {
  return {
    id: 'bk-guidance',
    source: 'direct',
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

describe('p.5-6: commission charged to the visitor forms part of the initial transaction', () => {
  it('£200 accommodation + £50 commission paid by the visitor → levy £12.50', () => {
    const r = calc(
      booking({
        source: 'booking_com',
        checkIn: '2026-09-01',
        checkOut: '2026-09-03',
        guestPaidGrossPence: 25_000,
        commissionPence: 5_000,
      }),
    )
    expect(r.levyPence).toBe(1_250)
  })
})

describe('p.6: commission paid by the provider (not the visitor) is not in the base', () => {
  it('£200 room-only paid by the visitor → levy £10.00', () => {
    const r = calc(
      booking({
        source: 'booking_com',
        checkIn: '2026-09-01',
        checkOut: '2026-09-03',
        guestPaidGrossPence: 20_000,
      }),
    )
    expect(r.levyPence).toBe(1_000)
  })
})

describe('pp.6-7: platform bookings — the accommodation provider remains liable', () => {
  it.each(['airbnb', 'booking_com', 'vrbo'] as const)('%s booking is charged and not flagged as remitted', (source) => {
    const r = calc(
      booking({ source, checkIn: '2026-09-01', checkOut: '2026-09-03', guestPaidGrossPence: 20_000 }),
    )
    expect(r.levyPence).toBe(1_000)
    expect(r.flags).not.toContain(Flag.BOOKING_COM_DOUBLE_REMIT)
  })
})

describe('p.4: standard cleaning is part of the accommodation cost, even when itemised', () => {
  it('Airbnb preset does not map the Cleaning Fee column to deductible extras', () => {
    expect(getPreset('AIRBNB').extras).toBeUndefined()
  })

  it('3 nights at £100 + £60 cleaning (in the guest-paid total) → levy on £360 = £18.00', () => {
    const r = calc(
      booking({ checkIn: '2026-09-01', checkOut: '2026-09-04', guestPaidGrossPence: 36_000 }),
    )
    expect(r.basePence).toBe(36_000)
    expect(r.levyPence).toBe(1_800)
  })

  it('optional extras such as parking are still excluded (p.3, s.5 of the 2024 Act)', () => {
    const r = calc(
      booking({
        checkIn: '2026-09-01',
        checkOut: '2026-09-04',
        guestPaidGrossPence: 36_000,
        extrasPence: 3_000,
      }),
    )
    expect(r.basePence).toBe(33_000)
    expect(r.levyPence).toBe(1_650)
  })
})

describe('p.12: 2% retention is kept from the levy due to the council', () => {
  it('£100 levy → keep £2, pay £98', () => {
    expect(netPayableToCouncil(10_000, 200)).toBe(9_800)
  })
})

describe('p.4: VAT on the levy goes to HMRC, not the council', () => {
  it('net payable to council excludes VAT on the levy', () => {
    const totals = sumReturnTotals([
      { levyPence: 10_000, vatOnLevyPence: 2_000, retentionPence: 200 },
      { levyPence: 5_000, vatOnLevyPence: 1_000, retentionPence: 100 },
    ])
    expect(totals.totalLevyPence).toBe(15_000)
    expect(totals.totalVatOnLevyPence).toBe(3_000)
    expect(totals.totalRetentionPence).toBe(300)
    expect(totals.netPayablePence).toBe(14_700)
  })

  it('VAT-registered booking still reports the levy itself (not levy + VAT) as levyPence', () => {
    const r = calc(
      booking({ checkIn: '2026-09-01', checkOut: '2026-09-03', guestPaidGrossPence: 20_000 }),
      { ...flat, vatRegistered: true },
    )
    expect(r.levyPence).toBe(1_000)
    expect(r.vatOnLevyPence).toBe(200)
    expect(netPayableToCouncil(r.levyPence, r.retentionPence)).toBe(1_000 - r.retentionPence)
  })
})
