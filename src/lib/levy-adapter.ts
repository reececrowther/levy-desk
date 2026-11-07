/**
 * Converts Prisma DB models to the types expected by the pure rules engine,
 * and converts engine Calculation output back to DB-insertable shape.
 * This keeps the rules engine free of Prisma imports.
 */
import type {
  Booking as DbBooking,
  Property as DbProperty,
} from '@prisma/client'
import type { Booking, Property, Calculation } from '../levy/types'
import type { AccommodationType, Country, BookingStatus, BookingSource } from '../levy/types'
import { cleaningFeeFromImportRow } from './maintenance/data-fixes'
import { excludeVat, VAT_INCLUSIVE_IMPORT_MARKER } from '../levy/vat'

export function toEngineBooking(db: DbBooking): Booking {
  return {
    id: db.id,
    source: db.source.toLowerCase() as BookingSource,
    externalRef: db.externalRef ?? undefined,
    bookedAt: db.bookedAt.toISOString().slice(0, 10),
    firstPaymentAt: db.firstPaymentAt?.toISOString().slice(0, 10),
    checkIn: db.checkIn.toISOString().slice(0, 10),
    checkOut: db.checkOut.toISOString().slice(0, 10),
    adults: db.adults,
    under18s: db.under18s,
    guestPaidGrossPence: db.guestPaidGrossPence,
    extrasPence: db.extrasPence,
    // A cleaning fee in the imported row is a one-off fee inside the guest-paid total,
    // unless it was deducted as an optional extra (then it is not in the base at all).
    perStayFeesPence: perStayFeesFor(db),
    commissionPence: db.commissionPence ?? undefined,
    payoutPence: db.payoutPence ?? undefined,
    currency: db.currency,
    status: db.status.toLowerCase() as BookingStatus,
  }
}

function perStayFeesFor(db: DbBooking): number {
  const rawFee = cleaningFeeFromImportRow(db.rawImportRow)
  const row = db.rawImportRow as Record<string, unknown> | null
  const fee = row && row[VAT_INCLUSIVE_IMPORT_MARKER] === 'true' ? excludeVat(rawFee) : rawFee
  if (fee === 0 || fee === db.extrasPence) return 0
  return Math.min(fee, Math.max(0, db.guestPaidGrossPence - db.extrasPence))
}

export function toEngineProperty(db: DbProperty): Property {
  return {
    id: db.id,
    name: db.name,
    council: db.council,
    country: db.country.toLowerCase() as Country,
    accommodationType: db.accommodationType.toLowerCase() as AccommodationType,
    unitsOrRooms: db.unitsOrRooms,
    vatRegistered: false, // stored on Workspace, not Property — passed separately
    breakfastIncluded: db.breakfastIncluded,
    breakfastRetailValuePence: db.breakfastRetailValuePence ?? undefined,
    welshRegisterNumber: db.welshRegisterNumber ?? undefined,
  }
}

export function calculationToDb(
  calc: Calculation,
): Omit<import('@prisma/client').Prisma.CalculationCreateInput, 'booking'> {
  return {
    schemeRuleId: calc.schemeRuleId,
    nightsCharged: calc.nightsCharged,
    basePence: calc.basePence,
    exclusionsPence: calc.exclusionsPence,
    levyPence: calc.levyPence,
    vatOnLevyPence: calc.vatOnLevyPence,
    retentionPence: calc.retentionPence,
    flags: calc.flags,
    working: calc.working as unknown as import('@prisma/client').Prisma.InputJsonValue,
  }
}
