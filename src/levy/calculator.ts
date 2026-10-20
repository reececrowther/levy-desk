import type {
  Booking,
  Property,
  SchemeRule,
  Calculation,
  CalculationWorking,
  PercentageRates,
  PerPersonRates,
  PerRoomRates,
  RoundingRule,
} from './types'
import { Flag } from './flags'

const VAT_STANDARD_RATE_PERCENT = 20

// ─── Rounding ────────────────────────────────────────────────────────────────

/**
 * Round a value in pence (may be fractional at intermediate stages) to integer pence.
 * Inputs and outputs are integers except during the rounding step itself.
 * We multiply rate * base in integer arithmetic where possible, falling back to
 * this function only at the final levy figure.
 */
function roundPence(value: number, rule: RoundingRule): number {
  switch (rule) {
    case 'half_up':
      return Math.floor(value + 0.5)
    case 'truncate':
      return Math.trunc(value)
    case 'half_even': {
      const floor = Math.floor(value)
      const frac = value - floor
      if (frac !== 0.5) return Math.round(value)
      return floor % 2 === 0 ? floor : floor + 1
    }
  }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Number of nights in a stay (checkOut is exclusive) */
function totalNights(checkIn: string, checkOut: string): number {
  const ms = Date.parse(checkOut) - Date.parse(checkIn)
  return Math.round(ms / 86_400_000)
}

/** Returns an array of stay-night dates (YYYY-MM-DD) for the given stay */
function stayNights(checkIn: string, checkOut: string): string[] {
  const nights: string[] = []
  const inMs = Date.parse(checkIn)
  const outMs = Date.parse(checkOut)
  for (let ms = inMs; ms < outMs; ms += 86_400_000) {
    nights.push(new Date(ms).toISOString().slice(0, 10))
  }
  return nights
}

function monthOf(date: string): number {
  return parseInt(date.slice(5, 7), 10)
}

// ─── Core calculate function ──────────────────────────────────────────────────

export interface CalculateOptions {
  rules: SchemeRule[]
  vatStandardRatePercent?: number
}

export function calculate(
  booking: Booking,
  property: Property,
  options: CalculateOptions,
): Calculation {
  const { rules, vatStandardRatePercent = VAT_STANDARD_RATE_PERCENT } = options

  // Find applicable rule: most recent version with effectiveFrom <= checkIn
  let rule = rules
    .filter(
      (r) =>
        r.council === property.council &&
        r.enabled &&
        r.effectiveFrom <= booking.checkIn,
    )
    .sort((a, b) => (a.effectiveFrom > b.effectiveFrom ? -1 : 1))
    .at(0)

  if (!rule) {
    // Fallback: stay starts before any rule's effectiveFrom but overlaps with one.
    // Use the earliest rule that starts before the stay ends (checkOut exclusive).
    rule = rules
      .filter(
        (r) =>
          r.council === property.council &&
          r.enabled &&
          r.effectiveFrom < booking.checkOut,
      )
      .sort((a, b) => (a.effectiveFrom < b.effectiveFrom ? -1 : 1))
      .at(0)
  }

  if (!rule) {
    return zeroCalculation(booking, property, 'no-rule', 'No applicable rule found for this council and stay date.')
  }

  if (!rule.enabled) {
    return zeroCalculation(booking, property, rule.id, 'Rule is disabled.')
  }

  const flags: string[] = []
  const steps: string[] = []

  // ── Cancelled / no-show ───────────────────────────────────────────────────
  if (booking.status === 'cancelled' || booking.status === 'no_show') {
    steps.push(`Booking status is ${booking.status} — levy is £0.00`)
    return buildCalculation(booking, rule, {
      nightsCharged: 0,
      basePence: 0,
      exclusionsPence: 0,
      levyPence: 0,
      vatOnLevyPence: 0,
      retentionPence: 0,
      flags,
      steps,
    })
  }

  // ── Booking.com double-remit flag ─────────────────────────────────────────
  if (booking.source === 'booking_com' && property.council === 'edinburgh') {
    flags.push(Flag.BOOKING_COM_DOUBLE_REMIT)
    steps.push('Booking.com source: flag raised — confirm whether Booking.com is remitting the levy.')
  }

  // ── Highland proposed flag ────────────────────────────────────────────────
  if (rule.status === 'proposed') {
    flags.push(Flag.HIGHLAND_PROPOSED)
    steps.push('Rule is proposed, not confirmed — calculation is indicative only.')
  }

  // ── Booking cut-off (Edinburgh: booked and paid before 2025-10-01) ────────
  if (rule.bookingCutOffDate) {
    const paymentDate = booking.firstPaymentAt ?? booking.bookedAt
    if (paymentDate < rule.bookingCutOffDate) {
      steps.push(
        `Booking first paid on ${paymentDate}, before cut-off ${rule.bookingCutOffDate} — levy is £0.00`,
      )
      return buildCalculation(booking, rule, {
        nightsCharged: 0,
        basePence: 0,
        exclusionsPence: 0,
        levyPence: 0,
        vatOnLevyPence: 0,
        retentionPence: 0,
        flags,
        steps,
      })
    }
    steps.push(
      `Booking first paid on ${paymentDate} — on or after cut-off ${rule.bookingCutOffDate}, levy applies.`,
    )
  }

  // ── Wales-specific checks ─────────────────────────────────────────────────
  if (rule.country === 'wales') {
    // Welsh register
    if (!property.welshRegisterNumber) {
      flags.push(Flag.WELSH_PROPERTY_UNREGISTERED)
      steps.push('Property has no Welsh register number.')
    }

    // Guest count
    if (booking.adults === 0 && booking.under18s === 0) {
      flags.push(Flag.WELSH_GUEST_COUNT_MISSING)
      steps.push('Guest count is missing — cannot calculate Welsh levy.')
      return buildCalculation(booking, rule, {
        nightsCharged: 0,
        basePence: 0,
        exclusionsPence: 0,
        levyPence: 0,
        vatOnLevyPence: 0,
        retentionPence: 0,
        flags,
        steps,
      })
    }

    // Cardiff pre-accounting-date flag
    const cardiffAccountingDate = '2026-09-28'
    if (booking.bookedAt < cardiffAccountingDate) {
      flags.push(Flag.BOOKING_PRE_ACCOUNTING_DATE)
      steps.push(
        `Booking made on ${booking.bookedAt}, before accounting date ${cardiffAccountingDate} — confirm levy was priced in.`,
      )
    }
  }

  const nights = stayNights(booking.checkIn, booking.checkOut)
  const total = nights.length
  steps.push(`Total nights in stay: ${total} (${booking.checkIn} to ${booking.checkOut})`)

  // ── Scotland: determine chargeable nights ─────────────────────────────────
  let chargeableNights: string[]
  let nightCapApplied = false
  let ambiguityFlag = false

  if (rule.country === 'scotland') {
    const scottishResult = computeScottishChargeableNights(nights, rule, booking, steps, flags)
    chargeableNights = scottishResult.nights
    nightCapApplied = scottishResult.capApplied
    if (chargeableNights.length === 0) {
      steps.push('No chargeable nights — levy is £0.00')
      return buildCalculation(booking, rule, {
        nightsCharged: 0,
        basePence: 0,
        exclusionsPence: 0,
        levyPence: 0,
        vatOnLevyPence: 0,
        retentionPence: 0,
        flags,
        steps,
      })
    }
    void ambiguityFlag
  } else {
    // Wales: all nights if stay < 32, else exempt
    chargeableNights = computeWelshChargeableNights(nights, booking, steps)
    nightCapApplied = false
    if (chargeableNights.length === 0) {
      steps.push('No chargeable nights (32-night exemption or no nights in scope) — levy is £0.00')
      return buildCalculation(booking, rule, {
        nightsCharged: 0,
        basePence: 0,
        exclusionsPence: 0,
        levyPence: 0,
        vatOnLevyPence: 0,
        retentionPence: 0,
        flags,
        steps,
      })
    }
  }

  steps.push(`Chargeable nights: ${chargeableNights.length}`)

  // ── Calculate levy by charge type ─────────────────────────────────────────
  let levyPence: number
  let basePence: number
  let exclusionsPence: number
  let rateDescription: string

  if (rule.chargeType === 'percentage') {
    const r = computePercentageLevy(booking, property, rule, chargeableNights, steps)
    levyPence = r.levyPence
    basePence = r.basePence
    exclusionsPence = r.exclusionsPence
    rateDescription = r.rateDescription
  } else if (rule.chargeType === 'per_person_per_night') {
    const r = computePerPersonLevy(booking, property, rule, chargeableNights, steps)
    levyPence = r.levyPence
    basePence = 0
    exclusionsPence = 0
    rateDescription = r.rateDescription
  } else {
    // per_room_per_night (Highland)
    const r = computePerRoomLevy(booking, property, rule, chargeableNights, steps)
    levyPence = r.levyPence
    basePence = 0
    exclusionsPence = 0
    rateDescription = r.rateDescription
  }

  // ── VAT on levy ───────────────────────────────────────────────────────────
  const vatOnLevyPence = property.vatRegistered
    ? roundPence((levyPence * vatStandardRatePercent) / 100, rule.roundingRule)
    : 0

  if (property.vatRegistered) {
    steps.push(
      `VAT registered: VAT on levy = ${levyPence}p × ${vatStandardRatePercent}% = ${vatOnLevyPence}p`,
    )
  } else {
    steps.push('Not VAT registered: no VAT on levy.')
  }

  // ── Retention ─────────────────────────────────────────────────────────────
  const retentionPence =
    rule.retentionPercent > 0
      ? roundPence((levyPence * rule.retentionPercent) / 100, rule.roundingRule)
      : 0

  if (rule.retentionPercent > 0) {
    steps.push(
      `Retention: ${levyPence}p × ${rule.retentionPercent}% = ${retentionPence}p kept by provider`,
    )
  }

  return buildCalculation(booking, rule, {
    nightsCharged: chargeableNights.length,
    basePence,
    exclusionsPence,
    levyPence,
    vatOnLevyPence,
    retentionPence,
    flags,
    steps,
    nightCapApplied,
    rateDescription,
    vatStandardRatePercent,
  })
}

// ─── Night computation helpers ────────────────────────────────────────────────

interface ScottishNightResult {
  nights: string[]
  capApplied: boolean
}

function computeScottishChargeableNights(
  nights: string[],
  rule: SchemeRule,
  booking: Booking,
  steps: string[],
  flags: string[],
): ScottishNightResult {
  const stayStart = rule.stayStartDate

  // Identify which nights are in scope by date
  const inScopeNights = stayStart
    ? nights.filter((n) => n >= stayStart)
    : nights

  if (stayStart && inScopeNights.length < nights.length) {
    const preScopeCount = nights.length - inScopeNights.length
    steps.push(
      `${preScopeCount} night(s) before stay start date ${stayStart} — not chargeable.`,
    )

    // Raise ambiguity flag if stay crosses the start date and there is a night cap
    if (rule.nightCap !== undefined && rule.nightCap !== null && preScopeCount > 0) {
      if (rule.edinburghCapBasis === 'first_chargeable_night' || rule.edinburghCapBasis === undefined) {
        flags.push(Flag.AMBIGUITY_EDINBURGH_CAP_START)
        steps.push(
          'Ambiguity: stay crosses the levy start date. Cap basis set to first_chargeable_night (conservative default). Host should confirm.',
        )
      }
    }
  }

  // Season filter (Highland)
  const seasonNights =
    rule.seasonMonths && rule.seasonMonths.length > 0
      ? inScopeNights.filter((n) => rule.seasonMonths!.includes(monthOf(n)))
      : inScopeNights

  if (rule.seasonMonths && seasonNights.length < inScopeNights.length) {
    steps.push(
      `Season filter: ${inScopeNights.length - seasonNights.length} night(s) outside season months — not chargeable.`,
    )
  }

  // Night cap
  if (rule.nightCap !== undefined && rule.nightCap !== null) {
    if (seasonNights.length > rule.nightCap) {
      steps.push(
        `Night cap of ${rule.nightCap} applied: ${seasonNights.length} chargeable nights → capped at ${rule.nightCap}.`,
      )
      return { nights: seasonNights.slice(0, rule.nightCap), capApplied: true }
    }
    steps.push(`Night cap of ${rule.nightCap}: ${seasonNights.length} nights, no cap needed.`)
  }

  return { nights: seasonNights, capApplied: false }
}

function computeWelshChargeableNights(
  nights: string[],
  booking: Booking,
  steps: string[],
): string[] {
  // 32-night exemption
  if (nights.length >= 32) {
    steps.push(`Booking is ${nights.length} nights — 32-night exemption applies. Levy is £0.00.`)
    return []
  }
  return nights
}

// ─── Levy computation by charge type ─────────────────────────────────────────

interface LevyResult {
  levyPence: number
  basePence: number
  exclusionsPence: number
  rateDescription: string
}

function computePercentageLevy(
  booking: Booking,
  property: Property,
  rule: SchemeRule,
  chargeableNights: string[],
  steps: string[],
): LevyResult {
  const rates = rule.rates as PercentageRates
  const nightCount = chargeableNights.length
  const totalNightCount = totalNights(booking.checkIn, booking.checkOut)

  // Pro-rate gross and extras to chargeable nights only
  const pricePerNight = Math.round(booking.guestPaidGrossPence / totalNightCount)
  const proratedGross = pricePerNight * nightCount
  steps.push(
    `Guest-paid gross: ${booking.guestPaidGrossPence}p over ${totalNightCount} nights = ${pricePerNight}p/night. ` +
    `Pro-rated to ${nightCount} chargeable nights: ${proratedGross}p.`,
  )

  // Extras (pro-rated)
  const extrasPerNight = booking.extrasPence > 0
    ? Math.round(booking.extrasPence / totalNightCount)
    : 0
  const proratedExtras = extrasPerNight * nightCount
  if (proratedExtras > 0) {
    steps.push(`Extras deduction (pro-rated): ${proratedExtras}p`)
  }

  // Breakfast deduction (pro-rated)
  let breakfastDeduction = 0
  if (property.breakfastIncluded && property.breakfastRetailValuePence) {
    // Breakfast retail value per night (all guests); for percentage schemes in Scotland
    // the spec says "included breakfast deducted at its retail value" — one value per night per unit
    const bfPerNight = property.breakfastRetailValuePence
    breakfastDeduction = bfPerNight * nightCount
    steps.push(`Breakfast deduction: ${bfPerNight}p × ${nightCount} nights = ${breakfastDeduction}p`)
  }

  const exclusionsPence = proratedExtras + breakfastDeduction
  const basePence = proratedGross - exclusionsPence
  steps.push(
    `Base = ${proratedGross}p − ${exclusionsPence}p (extras + breakfast) = ${basePence}p`,
  )

  // Levy = base × rate%
  const rawLevyPence = (basePence * rates.ratePercent) / 100
  const levyPence = roundPence(rawLevyPence, rule.roundingRule)
  steps.push(
    `Levy = ${basePence}p × ${rates.ratePercent}% = ${rawLevyPence}p → rounded to ${levyPence}p (${rule.roundingRule})`,
  )

  return {
    levyPence,
    basePence,
    exclusionsPence,
    rateDescription: `${rates.ratePercent}%`,
  }
}

function computePerPersonLevy(
  booking: Booking,
  property: Property,
  rule: SchemeRule,
  chargeableNights: string[],
  steps: string[],
): LevyResult {
  const rates = rule.rates as PerPersonRates
  const nightCount = chargeableNights.length
  const isLowerRate = rates.lowerRateAccommodationTypes.includes(property.accommodationType)

  const adultRatePence = isLowerRate ? rates.lowerRateAdultPence : rates.higherRatePence
  const under18RatePence = isLowerRate ? rates.lowerRateUnder18Pence : rates.higherRatePence

  steps.push(
    `Accommodation type: ${property.accommodationType} → ${isLowerRate ? 'lower' : 'higher'} rate applies.`,
  )
  steps.push(
    `Adults: ${booking.adults} × ${adultRatePence}p × ${nightCount} nights = ${booking.adults * adultRatePence * nightCount}p`,
  )
  steps.push(
    `Under-18s: ${booking.under18s} × ${under18RatePence}p × ${nightCount} nights = ${booking.under18s * under18RatePence * nightCount}p`,
  )

  const adultLevy = booking.adults * adultRatePence * nightCount
  const under18Levy = booking.under18s * under18RatePence * nightCount
  const rawLevyPence = adultLevy + under18Levy
  const levyPence = roundPence(rawLevyPence, rule.roundingRule)

  steps.push(`Total levy = ${rawLevyPence}p → rounded to ${levyPence}p (${rule.roundingRule})`)

  return {
    levyPence,
    basePence: 0,
    exclusionsPence: 0,
    rateDescription: isLowerRate
      ? `Adults ${rates.lowerRateAdultPence}p/person/night, Under-18s ${rates.lowerRateUnder18Pence}p/person/night (lower rate)`
      : `${rates.higherRatePence}p/person/night (higher rate)`,
  }
}

function computePerRoomLevy(
  booking: Booking,
  property: Property,
  rule: SchemeRule,
  chargeableNights: string[],
  steps: string[],
): LevyResult {
  const rates = rule.rates as PerRoomRates
  const nightCount = chargeableNights.length
  const isHostelOrCampsite =
    property.accommodationType === 'hostel_dorm' ||
    property.accommodationType === 'campsite'

  const ratePence = isHostelOrCampsite ? rates.hostelCampsitePence : rates.standardPence

  steps.push(
    `Accommodation type: ${property.accommodationType} → ${ratePence}p/room/night`,
  )

  const rawLevyPence = ratePence * property.unitsOrRooms * nightCount
  const levyPence = roundPence(rawLevyPence, rule.roundingRule)

  steps.push(
    `Levy = ${ratePence}p × ${property.unitsOrRooms} room(s) × ${nightCount} nights = ${levyPence}p`,
  )

  return {
    levyPence,
    basePence: 0,
    exclusionsPence: 0,
    rateDescription: `${ratePence}p/room/night`,
  }
}

// ─── Builder helpers ──────────────────────────────────────────────────────────

interface BuildArgs {
  nightsCharged: number
  basePence: number
  exclusionsPence: number
  levyPence: number
  vatOnLevyPence: number
  retentionPence: number
  flags: string[]
  steps: string[]
  nightCapApplied?: boolean
  rateDescription?: string
  vatStandardRatePercent?: number
}

function buildCalculation(
  booking: Booking,
  rule: SchemeRule,
  args: BuildArgs,
): Calculation {
  const {
    nightsCharged,
    basePence,
    exclusionsPence,
    levyPence,
    vatOnLevyPence,
    retentionPence,
    flags,
    steps,
    nightCapApplied = false,
    rateDescription = '',
    vatStandardRatePercent: vatRate = VAT_STANDARD_RATE_PERCENT,
  } = args

  const working: CalculationWorking = {
    ruleVersion: rule.id,
    totalNights: totalNights(booking.checkIn, booking.checkOut),
    chargeableNights: nightsCharged,
    nightCapApplied,
    nightCapValue: rule.nightCap,
    grossPence: booking.guestPaidGrossPence,
    extrasPence: booking.extrasPence,
    breakfastDeductionPence: basePence > 0 ? booking.guestPaidGrossPence - booking.extrasPence - basePence : 0,
    basePence,
    rateDescription,
    rawLevyPence: levyPence,
    levyPence,
    roundingRule: rule.roundingRule,
    vatRegistered: false,
    vatRatePercent: vatRate,
    vatOnLevyPence,
    retentionPercent: rule.retentionPercent,
    retentionPence,
    steps,
  }

  return {
    bookingId: booking.id,
    schemeRuleId: rule.id,
    nightsCharged,
    basePence,
    exclusionsPence,
    levyPence,
    vatOnLevyPence,
    retentionPence,
    flags,
    working,
  }
}

function zeroCalculation(
  booking: Booking,
  property: Property,
  ruleId: string,
  reason: string,
): Calculation {
  return {
    bookingId: booking.id,
    schemeRuleId: ruleId,
    nightsCharged: 0,
    basePence: 0,
    exclusionsPence: 0,
    levyPence: 0,
    vatOnLevyPence: 0,
    retentionPence: 0,
    flags: [],
    working: {
      ruleVersion: ruleId,
      totalNights: totalNights(booking.checkIn, booking.checkOut),
      chargeableNights: 0,
      nightCapApplied: false,
      grossPence: booking.guestPaidGrossPence,
      extrasPence: booking.extrasPence,
      breakfastDeductionPence: 0,
      basePence: 0,
      rateDescription: '',
      rawLevyPence: 0,
      levyPence: 0,
      roundingRule: 'half_up',
      vatRegistered: false,
      vatRatePercent: VAT_STANDARD_RATE_PERCENT,
      vatOnLevyPence: 0,
      retentionPercent: 0,
      retentionPence: 0,
      steps: [reason],
    },
  }
}
