/**
 * Shared recalculate helper used by server actions and import processor.
 * Always re-injects source-level flags (e.g. BOOKING_COM_DOUBLE_REMIT) so
 * they survive edit/recalculate cycles without needing to be stored separately.
 */
import { db } from './db'
import { calculate } from '@/levy/calculator'
import { SCHEME_RULES } from '@/levy/rules/index'
import { toEngineBooking, toEngineProperty, calculationToDb } from './levy-adapter'

export async function recalculate(bookingId: string): Promise<void> {
  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId } })
  const property = await db.property.findUniqueOrThrow({ where: { id: booking.propertyId } })
  const workspace = await db.workspace.findUniqueOrThrow({ where: { id: property.workspaceId } })

  const engineBooking = toEngineBooking(booking)
  const engineProperty = {
    ...toEngineProperty(property),
    vatRegistered: workspace.vatRegistered,
  }

  const calc = calculate(engineBooking, engineProperty, { rules: SCHEME_RULES })
  const calcData = calculationToDb(calc)

  await db.calculation.upsert({
    where: { bookingId },
    create: { bookingId, ...calcData },
    update: calcData,
  })
}
