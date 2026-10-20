import { describe, it, expect } from 'vitest'
import { calculate } from '../calculator'
import { SCHEME_RULES } from '../rules/index'
import { Flag } from '../flags'
import type { Booking, Property } from '../types'

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const edinburghProperty: Property = {
  id: 'prop-edin-1',
  name: 'Test Edinburgh Flat',
  council: 'edinburgh',
  country: 'scotland',
  accommodationType: 'self_catering',
  unitsOrRooms: 1,
  vatRegistered: false,
  breakfastIncluded: false,
}

const glasgowProperty: Property = {
  id: 'prop-gla-1',
  name: 'Test Glasgow Flat',
  council: 'glasgow',
  country: 'scotland',
  accommodationType: 'self_catering',
  unitsOrRooms: 1,
  vatRegistered: false,
  breakfastIncluded: false,
}

const stirlingProperty: Property = {
  id: 'prop-stir-1',
  name: 'Test Stirling Cottage',
  council: 'stirling',
  country: 'scotland',
  accommodationType: 'self_catering',
  unitsOrRooms: 1,
  vatRegistered: false,
  breakfastIncluded: false,
}

const aberdeenProperty: Property = {
  id: 'prop-aber-1',
  name: 'Test Aberdeen Hotel',
  council: 'aberdeen',
  country: 'scotland',
  accommodationType: 'hotel',
  unitsOrRooms: 1,
  vatRegistered: false,
  breakfastIncluded: false,
}

const cardiffSelfCateringProperty: Property = {
  id: 'prop-card-sc-1',
  name: 'Test Cardiff Self-Catering',
  council: 'cardiff',
  country: 'wales',
  accommodationType: 'self_catering',
  unitsOrRooms: 1,
  vatRegistered: false,
  breakfastIncluded: false,
  welshRegisterNumber: 'WR-12345',
}

const cardiffHostelProperty: Property = {
  id: 'prop-card-hostel-1',
  name: 'Test Cardiff Hostel',
  council: 'cardiff',
  country: 'wales',
  accommodationType: 'hostel_dorm',
  unitsOrRooms: 1,
  vatRegistered: false,
  breakfastIncluded: false,
  welshRegisterNumber: 'WR-67890',
}

function booking(overrides: Partial<Booking> & { checkIn: string; checkOut: string }): Booking {
  return {
    id: 'bk-test',
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

// ─── Worked example tests ─────────────────────────────────────────────────────

describe('Worked example 1 — Edinburgh, non-VAT, 7 nights at £100/night, booked 2026-05-01', () => {
  it('charges 5 nights at 5% = £25.00', () => {
    const b = booking({
      bookedAt: '2026-05-01',
      firstPaymentAt: '2026-05-01',
      checkIn: '2026-08-10',
      checkOut: '2026-08-17',
      guestPaidGrossPence: 70_000,
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    expect(result.nightsCharged).toBe(5)
    expect(result.levyPence).toBe(2_500)
    expect(result.vatOnLevyPence).toBe(0)
  })
})

describe('Worked example 2 — Edinburgh, same stay but booked and paid 2025-09-15', () => {
  it('returns £0.00 — booking predates cut-off', () => {
    const b = booking({
      bookedAt: '2025-09-15',
      firstPaymentAt: '2025-09-15',
      checkIn: '2026-08-10',
      checkOut: '2026-08-17',
      guestPaidGrossPence: 70_000,
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    expect(result.levyPence).toBe(0)
    expect(result.nightsCharged).toBe(0)
  })
})

describe('Worked example 3 — Edinburgh, stay 2026-07-22 to 2026-07-27, booked 2026-01-10', () => {
  it('charges nights from 2026-07-24 only and raises AMBIGUITY_EDINBURGH_CAP_START', () => {
    const b = booking({
      bookedAt: '2026-01-10',
      firstPaymentAt: '2026-01-10',
      checkIn: '2026-07-22',
      checkOut: '2026-07-27',
      guestPaidGrossPence: 50_000,
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    // 5 nights total: 22nd, 23rd are pre-scope; 24th, 25th, 26th are chargeable (3 nights ≤ cap)
    expect(result.nightsCharged).toBe(3)
    expect(result.flags).toContain(Flag.AMBIGUITY_EDINBURGH_CAP_START)
  })
})

describe('Worked example 4 — Edinburgh, £120/night incl breakfast £15, 3 nights', () => {
  it('deducts breakfast: base £315, levy £15.75', () => {
    const prop: Property = {
      ...edinburghProperty,
      id: 'prop-edin-bf',
      breakfastIncluded: true,
      breakfastRetailValuePence: 1_500, // £15 per night
    }
    const b = booking({
      bookedAt: '2026-06-01',
      firstPaymentAt: '2026-06-01',
      checkIn: '2026-08-01',
      checkOut: '2026-08-04',
      guestPaidGrossPence: 36_000, // £120 × 3
    })
    const result = calculate(b, prop, { rules: SCHEME_RULES })
    // Base = £360 − (£15 × 3 breakfast) = £315; levy = 5% of £315 = £15.75
    expect(result.basePence).toBe(31_500)
    expect(result.levyPence).toBe(1_575)
    expect(result.vatOnLevyPence).toBe(0)
  })
})

describe('Worked example 5 — Edinburgh, VAT-registered, £120/night incl 20% VAT, 2 nights', () => {
  it('uses ex-VAT base £200, levy £10.00, VAT on levy £2.00', () => {
    const prop: Property = {
      ...edinburghProperty,
      id: 'prop-edin-vat',
      vatRegistered: true,
      // Guest pays £120 incl 20% VAT → ex-VAT = £100/night
      // guestPaidGrossPence should be the ex-VAT figure (the spec says base excludes VAT on accommodation)
    }
    const b = booking({
      bookedAt: '2026-06-01',
      firstPaymentAt: '2026-06-01',
      checkIn: '2026-08-01',
      checkOut: '2026-08-03',
      // £120 incl VAT for 2 nights = £240 total; ex-VAT = £200
      guestPaidGrossPence: 20_000,
    })
    const result = calculate(b, prop, { rules: SCHEME_RULES })
    expect(result.basePence).toBe(20_000)
    expect(result.levyPence).toBe(1_000)  // 5% of £200 = £10
    expect(result.vatOnLevyPence).toBe(200)  // 20% of £10 = £2
  })
})

describe('Worked example 6 — Edinburgh, cancelled booking', () => {
  it('returns £0.00', () => {
    const b = booking({
      bookedAt: '2026-06-01',
      firstPaymentAt: '2026-06-01',
      checkIn: '2026-08-10',
      checkOut: '2026-08-17',
      guestPaidGrossPence: 70_000,
      status: 'cancelled',
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    expect(result.levyPence).toBe(0)
    expect(result.nightsCharged).toBe(0)
  })
})

describe('Worked example 7 — Glasgow, 7 nights at £100, stay February 2027', () => {
  it('charges all 7 nights at 5% = £35.00', () => {
    const b = booking({
      bookedAt: '2026-11-01',
      firstPaymentAt: '2026-11-01',
      checkIn: '2027-02-01',
      checkOut: '2027-02-08',
      guestPaidGrossPence: 70_000,
    })
    const result = calculate(b, glasgowProperty, { rules: SCHEME_RULES })
    expect(result.nightsCharged).toBe(7)
    expect(result.levyPence).toBe(3_500)
  })
})

describe('Worked example 8 — Stirling, 10 nights at £80, stay July 2027', () => {
  it('caps at 7 nights: 7 × £80 × 3% = £16.80', () => {
    const b = booking({
      bookedAt: '2027-05-01',
      firstPaymentAt: '2027-05-01',
      checkIn: '2027-07-01',
      checkOut: '2027-07-11',
      guestPaidGrossPence: 80_000,
    })
    const result = calculate(b, stirlingProperty, { rules: SCHEME_RULES })
    expect(result.nightsCharged).toBe(7)
    expect(result.levyPence).toBe(1_680)
  })
})

describe('Worked example 9 — Aberdeen, 2 nights at £150, stay May 2027', () => {
  it('charges 2 × £150 × 7% = £21.00', () => {
    const b = booking({
      bookedAt: '2027-02-01',
      firstPaymentAt: '2027-02-01',
      checkIn: '2027-05-01',
      checkOut: '2027-05-03',
      guestPaidGrossPence: 30_000,
    })
    const result = calculate(b, aberdeenProperty, { rules: SCHEME_RULES })
    expect(result.nightsCharged).toBe(2)
    expect(result.levyPence).toBe(2_100)
  })
})

describe('Worked example 10 — Cardiff self-catering, 2 adults + 1 child, 3 nights', () => {
  it('charges 9 person-nights at higher rate £1.30 = £11.70', () => {
    const b = booking({
      bookedAt: '2026-10-01',
      firstPaymentAt: '2026-10-01',
      checkIn: '2027-04-05',
      checkOut: '2027-04-08',
      adults: 2,
      under18s: 1,
      guestPaidGrossPence: 0,
    })
    const result = calculate(b, cardiffSelfCateringProperty, { rules: SCHEME_RULES })
    expect(result.nightsCharged).toBe(3)
    // (2 adults + 1 child) × 3 nights × 130p = 9 × 130 = 1170p = £11.70
    expect(result.levyPence).toBe(1_170)
  })
})

describe('Worked example 11 — Cardiff hostel dormitory, 2 adults + 1 under-18, 2 nights', () => {
  it('charges 4 adult person-nights at lower rate £0.75 = £3.00; under-18 = £0.00', () => {
    const b = booking({
      bookedAt: '2026-10-01',
      firstPaymentAt: '2026-10-01',
      checkIn: '2027-04-05',
      checkOut: '2027-04-07',
      adults: 2,
      under18s: 1,
      guestPaidGrossPence: 0,
    })
    const result = calculate(b, cardiffHostelProperty, { rules: SCHEME_RULES })
    expect(result.nightsCharged).toBe(2)
    // 2 adults × 2 nights × 75p = 300p; 1 under-18 × 2 nights × 0p = 0
    expect(result.levyPence).toBe(300)
  })
})

describe('Worked example 12 — Cardiff, 32-night booking', () => {
  it('returns £0.00 — 32-night exemption', () => {
    const b = booking({
      bookedAt: '2026-10-01',
      firstPaymentAt: '2026-10-01',
      checkIn: '2027-04-01',
      checkOut: '2027-05-03', // 32 nights
      adults: 2,
      under18s: 0,
      guestPaidGrossPence: 0,
    })
    const result = calculate(b, cardiffSelfCateringProperty, { rules: SCHEME_RULES })
    expect(result.levyPence).toBe(0)
    expect(result.nightsCharged).toBe(0)
  })
})

describe('Worked example 13 — Cardiff, booking made 2026-09-01 for stay May 2027', () => {
  it('is chargeable but raises BOOKING_PRE_ACCOUNTING_DATE flag', () => {
    const b = booking({
      bookedAt: '2026-09-01',
      firstPaymentAt: '2026-09-01',
      checkIn: '2027-05-01',
      checkOut: '2027-05-04',
      adults: 2,
      under18s: 0,
      guestPaidGrossPence: 0,
    })
    const result = calculate(b, cardiffSelfCateringProperty, { rules: SCHEME_RULES })
    expect(result.levyPence).toBeGreaterThan(0)
    expect(result.flags).toContain(Flag.BOOKING_PRE_ACCOUNTING_DATE)
  })
})

describe('Worked example 14 — Edinburgh quarterly return: correct quarter assignment and 2% retention', () => {
  it('shows 2% retention on Edinburgh levy', () => {
    const b = booking({
      bookedAt: '2026-06-01',
      firstPaymentAt: '2026-06-01',
      checkIn: '2026-08-10',
      checkOut: '2026-08-15', // 5 nights
      guestPaidGrossPence: 50_000,
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    // levy = 5 × £100 × 5% = £25.00 = 2500p
    expect(result.levyPence).toBe(2_500)
    // retention = 2% of 2500 = 50p
    expect(result.retentionPence).toBe(50)
    // Quarter check: stay is in Aug 2026 → Q3 2026
    expect(booking({ checkIn: '2026-08-10', checkOut: '2026-08-15' }).checkIn.slice(5, 7)).toBe('08')
  })
})

describe('Worked example 15 — Rule change: Edinburgh v2 at 6% from 2027-04-01', () => {
  it('Q3 2026 stay uses v1 at 5%', () => {
    const b = booking({
      bookedAt: '2026-06-01',
      firstPaymentAt: '2026-06-01',
      checkIn: '2026-08-10',
      checkOut: '2026-08-15',
      guestPaidGrossPence: 50_000,
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    expect(result.schemeRuleId).toBe('edinburgh-v1')
    expect(result.levyPence).toBe(2_500)
  })

  it('Q2 2027 stay uses v2 at 6%', () => {
    const b = booking({
      bookedAt: '2027-01-01',
      firstPaymentAt: '2027-01-01',
      checkIn: '2027-04-10',
      checkOut: '2027-04-15',
      guestPaidGrossPence: 50_000,
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    expect(result.schemeRuleId).toBe('edinburgh-v2')
    // 5 nights × £100 × 6% = £30.00 = 3000p
    expect(result.levyPence).toBe(3_000)
  })
})

// ─── Edge-case tests ──────────────────────────────────────────────────────────

describe('Edge case — zero nights (same-day turnaround)', () => {
  it('returns £0.00', () => {
    const b = booking({
      checkIn: '2026-08-10',
      checkOut: '2026-08-10',
      guestPaidGrossPence: 0,
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    expect(result.levyPence).toBe(0)
    expect(result.nightsCharged).toBe(0)
  })
})

describe('Edge case — exactly at Edinburgh night cap (5 nights)', () => {
  it('charges all 5 nights without triggering over-cap', () => {
    const b = booking({
      bookedAt: '2026-06-01',
      firstPaymentAt: '2026-06-01',
      checkIn: '2026-08-10',
      checkOut: '2026-08-15',
      guestPaidGrossPence: 50_000,
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    expect(result.nightsCharged).toBe(5)
    expect(result.working.nightCapApplied).toBe(false)
  })
})

describe('Edge case — Edinburgh cap + 1 (6 nights)', () => {
  it('caps at 5 nights', () => {
    const b = booking({
      bookedAt: '2026-06-01',
      firstPaymentAt: '2026-06-01',
      checkIn: '2026-08-10',
      checkOut: '2026-08-16',
      guestPaidGrossPence: 60_000,
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    expect(result.nightsCharged).toBe(5)
    expect(result.working.nightCapApplied).toBe(true)
  })
})

describe('Edge case — no-show booking returns £0', () => {
  it('returns £0.00', () => {
    const b = booking({
      bookedAt: '2026-06-01',
      firstPaymentAt: '2026-06-01',
      checkIn: '2026-08-10',
      checkOut: '2026-08-15',
      guestPaidGrossPence: 50_000,
      status: 'no_show',
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    expect(result.levyPence).toBe(0)
  })
})

describe('Edge case — stay crosses Edinburgh rule version boundary (v1 to v2)', () => {
  it('uses the rule version applicable to the check-in date', () => {
    // Stay starts 2027-03-30 (v1 era), check-in date determines rule version
    const b = booking({
      bookedAt: '2027-01-01',
      firstPaymentAt: '2027-01-01',
      checkIn: '2027-03-30',
      checkOut: '2027-04-05', // crosses into v2 era
      guestPaidGrossPence: 60_000,
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    // check-in is 2027-03-30 which is still within v1 effectiveTo 2027-03-31
    expect(result.schemeRuleId).toBe('edinburgh-v1')
  })
})

describe('Edge case — stay in February (leap year 2028)', () => {
  it('correctly counts 29 nights in February 2028', () => {
    const b = booking({
      bookedAt: '2027-10-01',
      firstPaymentAt: '2027-10-01',
      checkIn: '2028-02-01',
      checkOut: '2028-03-01',
      guestPaidGrossPence: 290_000,
    })
    // Edinburgh v2 applies; cap at 5 nights
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    expect(result.working.totalNights).toBe(29)
    expect(result.nightsCharged).toBe(5) // capped
  })
})

describe('Edge case — Edinburgh, Booking.com source raises double-remit flag', () => {
  it('raises BOOKING_COM_DOUBLE_REMIT', () => {
    const b = booking({
      source: 'booking_com',
      bookedAt: '2026-06-01',
      firstPaymentAt: '2026-06-01',
      checkIn: '2026-08-10',
      checkOut: '2026-08-15',
      guestPaidGrossPence: 50_000,
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    expect(result.flags).toContain(Flag.BOOKING_COM_DOUBLE_REMIT)
  })
})

describe('Edge case — Cardiff, missing guest count', () => {
  it('raises WELSH_GUEST_COUNT_MISSING and returns £0', () => {
    const b = booking({
      bookedAt: '2026-10-01',
      firstPaymentAt: '2026-10-01',
      checkIn: '2027-04-01',
      checkOut: '2027-04-04',
      adults: 0,
      under18s: 0,
      guestPaidGrossPence: 0,
    })
    const result = calculate(b, cardiffSelfCateringProperty, { rules: SCHEME_RULES })
    expect(result.flags).toContain(Flag.WELSH_GUEST_COUNT_MISSING)
    expect(result.levyPence).toBe(0)
  })
})

describe('Edge case — Cardiff, unregistered property', () => {
  it('raises WELSH_PROPERTY_UNREGISTERED', () => {
    const unregisteredProp: Property = {
      ...cardiffSelfCateringProperty,
      id: 'prop-card-unreg',
      welshRegisterNumber: undefined,
    }
    const b = booking({
      bookedAt: '2026-10-01',
      firstPaymentAt: '2026-10-01',
      checkIn: '2027-04-01',
      checkOut: '2027-04-04',
      adults: 2,
      under18s: 0,
      guestPaidGrossPence: 0,
    })
    const result = calculate(b, unregisteredProp, { rules: SCHEME_RULES })
    expect(result.flags).toContain(Flag.WELSH_PROPERTY_UNREGISTERED)
  })
})

describe('Edge case — Cardiff, exactly 31 nights (not exempt)', () => {
  it('charges 31 nights', () => {
    const b = booking({
      bookedAt: '2026-10-01',
      firstPaymentAt: '2026-10-01',
      checkIn: '2027-04-01',
      checkOut: '2027-05-02', // 31 nights
      adults: 1,
      under18s: 0,
      guestPaidGrossPence: 0,
    })
    const result = calculate(b, cardiffSelfCateringProperty, { rules: SCHEME_RULES })
    expect(result.nightsCharged).toBe(31)
    expect(result.levyPence).toBe(31 * 130) // 31 × £1.30
  })
})

describe('Edge case — Stirling, exactly at cap (7 nights)', () => {
  it('charges all 7 nights without applying cap', () => {
    const b = booking({
      bookedAt: '2027-04-01',
      firstPaymentAt: '2027-04-01',
      checkIn: '2027-07-01',
      checkOut: '2027-07-08',
      guestPaidGrossPence: 56_000,
    })
    const result = calculate(b, stirlingProperty, { rules: SCHEME_RULES })
    expect(result.nightsCharged).toBe(7)
    expect(result.working.nightCapApplied).toBe(false)
  })
})

describe('Edge case — stay before any scheme exists (no rule found)', () => {
  it('returns £0 and no rule', () => {
    const b = booking({
      checkIn: '2020-01-01',
      checkOut: '2020-01-05',
      guestPaidGrossPence: 40_000,
    })
    const result = calculate(b, edinburghProperty, { rules: SCHEME_RULES })
    expect(result.levyPence).toBe(0)
    expect(result.schemeRuleId).toBe('no-rule')
  })
})
