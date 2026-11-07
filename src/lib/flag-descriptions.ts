import { Flag } from '@/levy/flags'

export type FlagSeverity = 'error' | 'warning' | 'info'

export type FlagDescription = {
  title: string
  detail: string
  severity: FlagSeverity
  /** If true, user can acknowledge to remove from exceptions queue without a data fix */
  acknowledgeOnly: boolean
}

export const FLAG_DESCRIPTIONS: Record<string, FlagDescription> = {
  [Flag.AMBIGUITY_EDINBURGH_CAP_START]: {
    // Legacy flag: no longer raised (Nov 2026). Kept so older stored calculations still render.
    title: 'Stay crossing 24 July 2026 (legacy check)',
    detail:
      'No longer needed. Edinburgh Council guidance confirms stays that began before 24 July 2026 are not liable at all. Recalculate the booking to clear this flag.',
    severity: 'warning',
    acknowledgeOnly: true,
  },
  [Flag.PAYMENT_DATE_UNKNOWN]: {
    title: 'Booked before 1 October 2025: payment date needed',
    detail:
      'Edinburgh exempts stays booked and paid (in part or full) before 1 October 2025, but only if the payment was non-refundable; a refundable deposit does not count. No payment date is recorded, so the levy has been charged. If a non-refundable payment was made before 1 October 2025, edit the booking and add the payment date to exempt it. Otherwise, acknowledge.',
    severity: 'warning',
    acknowledgeOnly: true,
  },
  [Flag.COMMISSION_UNKNOWN]: {
    title: 'Commission amount unknown',
    detail:
      'The levy base should use the full guest-paid gross, including the platform commission. Please enter the gross amount so the correct levy can be calculated.',
    severity: 'error',
    acknowledgeOnly: false,
  },
  [Flag.BOOKING_COM_DOUBLE_REMIT]: {
    // Legacy flag: no longer raised (Nov 2026). Kept so older stored calculations still render.
    title: 'Booking.com booking (legacy check)',
    detail:
      'This check is no longer needed. Edinburgh Council guidance confirms platforms do not pay the levy to the council for you, so Booking.com bookings must be included in your return. Recalculate the booking to clear this flag.',
    severity: 'warning',
    acknowledgeOnly: true,
  },
  [Flag.BASE_IS_PAYOUT_NOT_GROSS]: {
    title: 'Levy calculated from payout, not gross',
    detail:
      'The guest-paid gross was not available when this booking was imported, so the host payout was used as the levy base. The correct base is the full amount the guest paid (including commission). Please enter the correct gross amount.',
    severity: 'error',
    acknowledgeOnly: false,
  },
  [Flag.WELSH_GUEST_COUNT_MISSING]: {
    title: 'Welsh levy blocked — guest count missing',
    detail:
      'The Cardiff visitor levy is calculated per person per night. No guest count was provided for this booking. You cannot file the return until you supply the number of adults and children.',
    severity: 'error',
    acknowledgeOnly: false,
  },
  [Flag.BOOKING_PRE_ACCOUNTING_DATE]: {
    title: 'Booking made before accounting date',
    detail:
      "This booking was made before 28 September 2026. Confirm that the visitor levy was priced into this booking and that you intend to include it in your return.",
    severity: 'warning',
    acknowledgeOnly: true,
  },
  [Flag.WELSH_PROPERTY_UNREGISTERED]: {
    title: 'Welsh property not registered',
    detail:
      'This property has no Welsh Register Number. Registration has been required for all holiday lets in Wales since 1 October 2026. Update the property record with the registration number.',
    severity: 'error',
    acknowledgeOnly: false,
  },
  [Flag.VAT_THRESHOLD_WARNING]: {
    title: 'Approaching VAT threshold',
    detail:
      'Your rolling 12-month accommodation and levy turnover is within £5,000 of the VAT registration threshold (currently £90,000). Speak to an accountant before you cross the threshold.',
    severity: 'warning',
    acknowledgeOnly: true,
  },
  [Flag.HIGHLAND_PROPOSED]: {
    title: 'Highland scheme is proposed only',
    detail:
      'The Highland Council visitor levy is a proposed scheme that has not yet been enacted into law. This calculation is indicative only and cannot be included in a filed return.',
    severity: 'warning',
    acknowledgeOnly: true,
  },
  [Flag.UNVERIFIED_START_DATE]: {
    title: 'Levy start date unverified',
    detail:
      'The start date for this council\'s levy has not been officially confirmed. A conservative estimate has been used. Acknowledge once you have verified the correct date with the council.',
    severity: 'warning',
    acknowledgeOnly: true,
  },
}

export function flagDescription(flag: string): FlagDescription {
  return (
    FLAG_DESCRIPTIONS[flag] ?? {
      title: flag,
      detail: 'Unknown flag.',
      severity: 'info',
      acknowledgeOnly: true,
    }
  )
}
