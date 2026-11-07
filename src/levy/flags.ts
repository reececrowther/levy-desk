export const Flag = {
  /** Legacy (no longer raised, Nov 2026): resolved by Edinburgh guidance v2.1 p.10 (stays commencing before 24 July 2026 are not liable). */
  AMBIGUITY_EDINBURGH_CAP_START: 'AMBIGUITY_EDINBURGH_CAP_START',

  /** Only payout is known; gross must be confirmed or grossed-up */
  COMMISSION_UNKNOWN: 'COMMISSION_UNKNOWN',

  /** Legacy (no longer raised, Nov 2026): platforms do not remit for hosts. Kept for stored calculations. */
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

  /** Booking made before the cut-off but no payment date recorded: levy charged until a payment date shows it is exempt */
  PAYMENT_DATE_UNKNOWN: 'PAYMENT_DATE_UNKNOWN',

  /** Council start date is unverified; exact day not confirmed in legislation */
  UNVERIFIED_START_DATE: 'UNVERIFIED_START_DATE',
} as const

export type Flag = (typeof Flag)[keyof typeof Flag]
