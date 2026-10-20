export const Flag = {
  /** Edinburgh: stay starts before 2026-07-24 — cap basis is ambiguous */
  AMBIGUITY_EDINBURGH_CAP_START: 'AMBIGUITY_EDINBURGH_CAP_START',

  /** Only payout is known; gross must be confirmed or grossed-up */
  COMMISSION_UNKNOWN: 'COMMISSION_UNKNOWN',

  /** Booking.com source for Edinburgh — confirm who is remitting the levy */
  BOOKING_COM_DOUBLE_REMIT: 'BOOKING_COM_DOUBLE_REMIT',

  /** Gross was not available; levy base calculated from payout */
  BASE_IS_PAYOUT_NOT_GROSS: 'BASE_IS_PAYOUT_NOT_GROSS',

  /** Cardiff booking has no guest count; return is blocked until resolved */
  WELSH_GUEST_COUNT_MISSING: 'WELSH_GUEST_COUNT_MISSING',

  /** Cardiff booking made before 2026-09-28 — confirm levy was priced in */
  BOOKING_PRE_ACCOUNTING_DATE: 'BOOKING_PRE_ACCOUNTING_DATE',

  /** Welsh property has no register number */
  WELSH_PROPERTY_UNREGISTERED: 'WELSH_PROPERTY_UNREGISTERED',

  /** Rolling 12-month turnover including levy is within warning margin of VAT threshold */
  VAT_THRESHOLD_WARNING: 'VAT_THRESHOLD_WARNING',

  /** Highland scheme is proposed, not confirmed; calculation is indicative only */
  HIGHLAND_PROPOSED: 'HIGHLAND_PROPOSED',

  /** Council start date is unverified; exact day not confirmed in legislation */
  UNVERIFIED_START_DATE: 'UNVERIFIED_START_DATE',
} as const

export type Flag = (typeof Flag)[keyof typeof Flag]
