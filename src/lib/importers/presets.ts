/**
 * Preset column mappings for known booking platform exports.
 * Keys are our internal field names; values are the expected CSV column headers.
 * Treat these as editable defaults — export formats change.
 *
 * Last verified: October 2026. Update the name string when re-verified.
 */
export interface ColumnMappingDef {
  [targetField: string]: string
}

/** All target fields the importer understands */
export const TARGET_FIELDS = [
  'externalRef',
  'bookedAt',
  'firstPaymentAt',
  'checkIn',
  'checkOut',
  'adults',
  'under18s',
  'guestPaidGross',
  'extras',
  'commission',
  'payout',
  'status',
] as const

export type TargetField = (typeof TARGET_FIELDS)[number]

export const TARGET_FIELD_LABELS: Record<TargetField, string> = {
  externalRef: 'Booking reference',
  bookedAt: 'Booking date',
  firstPaymentAt: 'First payment date',
  checkIn: 'Check-in date',
  checkOut: 'Check-out date',
  adults: 'Adults',
  under18s: 'Under-18s',
  guestPaidGross: 'Guest-paid gross (£)',
  extras: 'Extras / cleaning fee (£)',
  commission: 'Platform commission (£)',
  payout: 'Host payout (£)',
  status: 'Booking status',
}

export const REQUIRED_TARGET_FIELDS: TargetField[] = ['checkIn', 'checkOut']

/** Airbnb CSV export — verified October 2026 */
export const AIRBNB_PRESET: ColumnMappingDef = {
  externalRef: 'Confirmation Code',
  bookedAt: 'Booked',
  checkIn: 'Start Date',
  checkOut: 'End Date',
  adults: 'Guests',
  guestPaidGross: 'Amount',
  extras: 'Cleaning Fee',
  commission: 'Host Fee',
  payout: 'Paid Out',
  status: 'Type',
}

/** Booking.com reservations CSV export — verified October 2026 */
export const BOOKING_COM_PRESET: ColumnMappingDef = {
  externalRef: 'Reservation ID',
  bookedAt: 'Reservation Creation Date',
  checkIn: 'Arrival Date',
  checkOut: 'Departure Date',
  adults: 'Number of guests',
  guestPaidGross: 'Amount',
  commission: 'Commission Amount',
  payout: 'Outstanding Balance',
  status: 'Status',
}

export const PRESETS: Record<string, { name: string; mapping: ColumnMappingDef }> = {
  AIRBNB: { name: 'Airbnb default (Oct 2026)', mapping: AIRBNB_PRESET },
  BOOKING_COM: { name: 'Booking.com default (Oct 2026)', mapping: BOOKING_COM_PRESET },
}

/** Return the best-guess preset for a source, or an empty mapping */
export function getPreset(source: string): ColumnMappingDef {
  return PRESETS[source]?.mapping ?? {}
}
