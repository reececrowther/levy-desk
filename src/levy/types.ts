export type BookingStatus = 'confirmed' | 'cancelled' | 'no_show'

export type BookingSource =
  | 'airbnb'
  | 'booking_com'
  | 'vrbo'
  | 'direct'
  | 'software'
  | 'other'

export type AccommodationType =
  | 'self_catering'
  | 'bnb_guest_house'
  | 'hotel'
  | 'hostel_dorm'
  | 'campsite'
  | 'other'

export type Country = 'scotland' | 'wales'

export type ChargeType = 'percentage' | 'per_room_per_night' | 'per_person_per_night'

export type RuleStatus = 'live' | 'confirmed' | 'proposed'

export type RoundingRule = 'half_up' | 'truncate' | 'half_even'

/** Edinburgh ambiguity: does the 5-night cap count from the first night of the stay or the first chargeable night? */
export type EdinburghCapBasis = 'first_chargeable_night' | 'first_night_of_stay'

/** When only a payout is known, which figure do we use for the levy base? */
export type LevyBaseIncludes = 'guest_paid_gross' | 'payout_only'

export interface Booking {
  id: string
  source: BookingSource
  externalRef?: string
  /** Date the booking was made (YYYY-MM-DD) */
  bookedAt: string
  /** Date first payment was received (YYYY-MM-DD). Required for Edinburgh cut-off rule. */
  firstPaymentAt?: string
  /** Stay check-in date (YYYY-MM-DD) */
  checkIn: string
  /** Stay check-out date (YYYY-MM-DD). Exclusive: guest departs on this date, not charged this night. */
  checkOut: string
  adults: number
  under18s: number
  /** Total amount the guest paid (pence), including platform commission, EXCLUDING VAT on accommodation */
  guestPaidGrossPence: number
  /** Separately priced extras (meals, parking, transport) excluded from levy base (pence) */
  extrasPence: number
  /** Platform commission (pence) — informational only; levy base uses guestPaidGross */
  commissionPence?: number
  /** Host payout (pence) — may be less than gross when platform takes commission */
  payoutPence?: number
  currency: string
  status: BookingStatus
}

export interface Property {
  id: string
  name: string
  council: string
  country: Country
  accommodationType: AccommodationType
  unitsOrRooms: number
  vatRegistered: boolean
  vatNumber?: string
  welshRegisterNumber?: string
  /** Whether breakfast is included in the room price */
  breakfastIncluded: boolean
  /** Retail value of breakfast per person per night (pence). Required when breakfastIncluded is true. */
  breakfastRetailValuePence?: number
}

/** Percentage scheme rates (Scotland) */
export interface PercentageRates {
  ratePercent: number
}

/** Fixed per-room-per-night rates (Highland) */
export interface PerRoomRates {
  standardPence: number
  hostelCampsitePence: number
}

/** Per-person-per-night rates (Wales) */
export interface PerPersonRates {
  higherRatePence: number
  lowerRateAdultPence: number
  lowerRateUnder18Pence: number
  /** Accommodation types that use the lower rate */
  lowerRateAccommodationTypes: AccommodationType[]
}

export interface SchemeRule {
  id: string
  council: string
  country: Country
  effectiveFrom: string
  effectiveTo?: string
  chargeType: ChargeType
  rates: PercentageRates | PerRoomRates | PerPersonRates
  /** Maximum consecutive nights charged per stay. Null = no cap. */
  nightCap?: number
  /** Months (1-indexed) when levy applies. Null = all year. */
  seasonMonths?: number[]
  /** Stays before this date (YYYY-MM-DD) are not chargeable */
  stayStartDate?: string
  /** Bookings made AND first-paid before this date (YYYY-MM-DD) owe nothing */
  bookingCutOffDate?: string
  /** Percentage of collected levy the provider retains (e.g. 2 = 2%) */
  retentionPercent: number
  filingFrequency: 'quarterly' | 'annual'
  status: RuleStatus
  /** False = rule exists but is disabled (e.g. Highland proposed scheme) */
  enabled: boolean
  sourceUrl: string
  verified: boolean
  roundingRule: RoundingRule
  /** Config: Edinburgh 5-night cap basis for cross-boundary stays */
  edinburghCapBasis?: EdinburghCapBasis
}

export interface Calculation {
  bookingId: string
  schemeRuleId: string
  /** Nights on which the levy applies */
  nightsCharged: number
  /** Levy base after deductions (pence) */
  basePence: number
  /** Extras + breakfast deducted from gross (pence) */
  exclusionsPence: number
  /** Levy owed (pence) */
  levyPence: number
  /** VAT charged on levy (0 for non-VAT hosts) (pence) */
  vatOnLevyPence: number
  /** Amount retained by provider (pence) */
  retentionPence: number
  flags: string[]
  /** Full step-by-step working for audit and display */
  working: CalculationWorking
}

export interface CalculationWorking {
  ruleVersion: string
  totalNights: number
  chargeableNights: number
  nightCapApplied: boolean
  nightCapValue?: number
  grossPence: number
  extrasPence: number
  breakfastDeductionPence: number
  basePence: number
  rateDescription: string
  rawLevyPence: number
  levyPence: number
  roundingRule: RoundingRule
  vatRegistered: boolean
  vatRatePercent: number
  vatOnLevyPence: number
  retentionPercent: number
  retentionPence: number
  steps: string[]
}
