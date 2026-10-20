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
    commissionPence: db.commissionPence ?? undefined,
    payoutPence: db.payoutPence ?? undefined,
    currency: db.currency,
    status: db.status.toLowerCase() as BookingStatus,
  }
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
