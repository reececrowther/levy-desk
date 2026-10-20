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
    title: 'Edinburgh cap basis unclear',
    detail:
      'The levy start date (24 July 2026) falls mid-stay. It is unclear whether the 5-night cap counts from night 1 of the stay or from the first chargeable night. The conservative default (first chargeable night) has been used. Acknowledge if you are satisfied with this, or contact Edinburgh Council for guidance.',
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
    title: 'Booking.com — confirm who remits the levy',
    detail:
      'Booking.com has been collecting and remitting the Edinburgh visitor levy on behalf of hosts since October 2025. If Booking.com is remitting the levy for this booking, you must not include it in your own return. Confirm below once you have checked.',
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
