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

describe('p.10: stays commencing before 24 July 2026 are not liable', () => {
  it('stay 23–28 July 2026 → £0', () => {
    const r = calc(booking({ checkIn: '2026-07-23', checkOut: '2026-07-28', guestPaidGrossPence: 50_000 }))
    expect(r.levyPence).toBe(0)
  })
  it('stay starting on 24 July 2026 is liable', () => {
    const r = calc(booking({ checkIn: '2026-07-24', checkOut: '2026-07-26', guestPaidGrossPence: 20_000 }))
    expect(r.levyPence).toBe(1_000)
  })
})

describe('p.10: cut-off depends on payment before 1 October 2025, not the booking date alone', () => {
  it('booked and paid before the cut-off → exempt', () => {
    const r = calc(
      booking({ bookedAt: '2025-09-01', firstPaymentAt: '2025-09-01', checkIn: '2026-08-01', checkOut: '2026-08-03', guestPaidGrossPence: 20_000 }),
    )
    expect(r.levyPence).toBe(0)
  })
  it('booked before the cut-off but first paid after → liable', () => {
    const r = calc(
      booking({ bookedAt: '2025-09-01', firstPaymentAt: '2025-11-01', checkIn: '2026-08-01', checkOut: '2026-08-03', guestPaidGrossPence: 20_000 }),
    )
    expect(r.levyPence).toBe(1_000)
  })
  it('booked before the cut-off with no payment date → charged and flagged, not silently exempted', () => {
    const r = calc(
      booking({ bookedAt: '2025-09-01', firstPaymentAt: undefined, checkIn: '2026-08-01', checkOut: '2026-08-03', guestPaidGrossPence: 20_000 }),
    )
    expect(r.levyPence).toBe(1_000)
    expect(r.flags).toContain(Flag.PAYMENT_DATE_UNKNOWN)
  })
  it('booked after the cut-off with no payment date → charged, no flag', () => {
    const r = calc(
      booking({ bookedAt: '2026-02-01', firstPaymentAt: undefined, checkIn: '2026-08-01', checkOut: '2026-08-03', guestPaidGrossPence: 20_000 }),
    )
    expect(r.levyPence).toBe(1_000)
    expect(r.flags).not.toContain(Flag.PAYMENT_DATE_UNKNOWN)
  })
})

describe('p.8: 5-night cap — one-off fees charged in full, nightly price only for the first 5 nights', () => {
  it('7 nights at £100 + £70 flat cleaning: base = 5 × £100 + £70 = £570 → levy £28.50', () => {
    const r = calc(
      booking({ checkIn: '2026-09-01', checkOut: '2026-09-08', guestPaidGrossPence: 77_000, perStayFeesPence: 7_000 }),
    )
    expect(r.nightsCharged).toBe(5)
    expect(r.basePence).toBe(57_000)
    expect(r.levyPence).toBe(2_850)
  })
  it('without a known one-off fee the whole total is averaged (previous behaviour)', () => {
    const r = calc(booking({ checkIn: '2026-09-01', checkOut: '2026-09-08', guestPaidGrossPence: 77_000 }))
    expect(r.basePence).toBe(55_000)
  })
  it('stays within the cap are unaffected by one-off fees', () => {
    const r = calc(
      booking({ checkIn: '2026-09-01', checkOut: '2026-09-04', guestPaidGrossPence: 37_000, perStayFeesPence: 7_000 }),
    )
    expect(r.basePence).toBe(37_000)
  })
})

describe('p.3: levy base is net of VAT', () => {
  it('£240 VAT-inclusive → £200 net → levy £10.00', async () => {
    const { excludeVat } = await import('../vat')
    expect(excludeVat(24_000)).toBe(20_000)
    const r = calc(
      booking({ checkIn: '2026-09-01', checkOut: '2026-09-03', guestPaidGrossPence: excludeVat(24_000) }),
      { ...flat, vatRegistered: true },
    )
    expect(r.levyPence).toBe(1_000)
  })
  it('rounds to the nearest penny', async () => {
    const { excludeVat } = await import('../vat')
    expect(excludeVat(1_001)).toBe(834) // 834.17
    expect(excludeVat(1_003)).toBe(836) // 835.83
  })
})
