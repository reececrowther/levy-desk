import type { SchemeRule, PercentageRates, PerPersonRates, PerRoomRates } from '../types'

export const SCHEME_RULES: SchemeRule[] = [
  // ─── Edinburgh v1 (live from 2026-07-24) ─────────────────────────────────
  {
    id: 'edinburgh-v1',
    council: 'edinburgh',
    country: 'scotland',
    effectiveFrom: '2026-07-24',
    effectiveTo: '2027-03-31',
    chargeType: 'percentage',
    rates: { ratePercent: 5 } satisfies PercentageRates,
    nightCap: 5,
    stayStartDate: '2026-07-24',
    bookingCutOffDate: '2025-10-01',
    retentionPercent: 2,
    filingFrequency: 'quarterly',
    status: 'live',
    enabled: true,
    sourceUrl: 'https://www.edinburgh.gov.uk/downloads/file/37836/edinburgh-visitor-levy-scheme-information-for-accommodation-providers',
    verified: false,
    roundingRule: 'half_up',
    edinburghCapBasis: 'first_chargeable_night',
  },

  // ─── Edinburgh v2 (test fixture for worked example 15 — not a real change) ──
  {
    id: 'edinburgh-v2',
    council: 'edinburgh',
    country: 'scotland',
    effectiveFrom: '2027-04-01',
    chargeType: 'percentage',
    rates: { ratePercent: 6 } satisfies PercentageRates,
    nightCap: 5,
    stayStartDate: '2026-07-24',
    bookingCutOffDate: '2025-10-01',
    retentionPercent: 2,
    filingFrequency: 'quarterly',
    status: 'confirmed',
    enabled: true,
    sourceUrl: 'https://www.edinburgh.gov.uk/downloads/file/37836/edinburgh-visitor-levy-scheme-information-for-accommodation-providers',
    verified: false,
    roundingRule: 'half_up',
    edinburghCapBasis: 'first_chargeable_night',
  },

  // ─── Glasgow (confirmed; exact start day UNVERIFIED) ─────────────────────
  {
    id: 'glasgow-v1',
    council: 'glasgow',
    country: 'scotland',
    effectiveFrom: '2027-01-01',
    chargeType: 'percentage',
    rates: { ratePercent: 5 } satisfies PercentageRates,
    retentionPercent: 0,
    filingFrequency: 'quarterly',
    status: 'confirmed',
    enabled: true,
    sourceUrl: 'https://www.visitscotland.com/travel-planning/visitor-levy',
    verified: false,
    roundingRule: 'half_up',
  },

  // ─── Aberdeen (confirmed; exact start day UNVERIFIED) ────────────────────
  {
    id: 'aberdeen-v1',
    council: 'aberdeen',
    country: 'scotland',
    effectiveFrom: '2027-04-01',
    chargeType: 'percentage',
    rates: { ratePercent: 7 } satisfies PercentageRates,
    retentionPercent: 0,
    filingFrequency: 'quarterly',
    status: 'confirmed',
    enabled: true,
    sourceUrl: 'https://www.visitscotland.com/travel-planning/visitor-levy',
    verified: false,
    roundingRule: 'half_up',
  },

  // ─── Stirling (confirmed; exact start day UNVERIFIED) ────────────────────
  {
    id: 'stirling-v1',
    council: 'stirling',
    country: 'scotland',
    effectiveFrom: '2027-06-01',
    chargeType: 'percentage',
    rates: { ratePercent: 3 } satisfies PercentageRates,
    nightCap: 7,
    retentionPercent: 0,
    filingFrequency: 'quarterly',
    status: 'confirmed',
    enabled: true,
    sourceUrl: 'https://www.visitscotland.com/travel-planning/visitor-levy',
    verified: false,
    roundingRule: 'half_up',
  },

  // ─── West Dunbartonshire (confirmed; exact start day UNVERIFIED) ──────────
  {
    id: 'west-dunbartonshire-v1',
    council: 'west_dunbartonshire',
    country: 'scotland',
    effectiveFrom: '2027-07-01',
    chargeType: 'percentage',
    rates: { ratePercent: 5 } satisfies PercentageRates,
    retentionPercent: 0,
    filingFrequency: 'quarterly',
    status: 'confirmed',
    enabled: true,
    sourceUrl: 'https://www.visitscotland.com/travel-planning/visitor-levy',
    verified: false,
    roundingRule: 'half_up',
  },

  // ─── Highland (DISABLED — proposed only) ─────────────────────────────────
  {
    id: 'highland-v1',
    council: 'highland',
    country: 'scotland',
    effectiveFrom: '9999-01-01',
    chargeType: 'per_room_per_night',
    rates: {
      standardPence: 500,
      hostelCampsitePence: 200,
    } satisfies PerRoomRates,
    seasonMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    retentionPercent: 5,
    filingFrequency: 'quarterly',
    status: 'proposed',
    enabled: false,
    sourceUrl: 'https://www.theukpulse.co.uk/travel/highland-council-plans-5-a-night-visitor-levy-targeting-95m-annual-revenue',
    verified: false,
    roundingRule: 'half_up',
  },

  // ─── Cardiff (Wales, from 2027-04-01) ─────────────────────────────────────
  {
    id: 'cardiff-v1',
    council: 'cardiff',
    country: 'wales',
    effectiveFrom: '2027-04-01',
    chargeType: 'per_person_per_night',
    rates: {
      higherRatePence: 130,
      lowerRateAdultPence: 75,
      lowerRateUnder18Pence: 0,
      lowerRateAccommodationTypes: ['hostel_dorm', 'campsite'],
    } satisfies PerPersonRates,
    retentionPercent: 0,
    filingFrequency: 'quarterly',
    status: 'confirmed',
    enabled: true,
    sourceUrl: 'https://www.gov.wales/node/76838',
    verified: false,
    roundingRule: 'half_up',
  },
]

/**
 * Returns the applicable rule for a given council and stay check-in date.
 * If multiple versions exist (effectiveFrom <= checkIn), returns the most recent.
 * Only returns enabled rules.
 */
export function findRule(council: string, checkIn: string): SchemeRule | undefined {
  return SCHEME_RULES.filter(
    (r) => r.council === council && r.enabled && r.effectiveFrom <= checkIn,
  )
    .sort((a, b) => (a.effectiveFrom > b.effectiveFrom ? -1 : 1))
    .at(0)
}
