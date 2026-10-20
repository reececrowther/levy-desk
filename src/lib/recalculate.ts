/**
 * Shared recalculate helper used by server actions and import processor.
 * Always re-injects source-level flags (e.g. BOOKING_COM_DOUBLE_REMIT) so
 * they survive edit/recalculate cycles without needing to be stored separately.
 */
import { db } from './db'
import { calculate } from '@/levy/calculator'
import { SCHEME_RULES } from '@/levy/rules/index'
import { Flag } from '@/levy/flags'
import { toEngineBooking, toEngineProperty, calculationToDb } from './levy-adapter'

function sourceFlags(source: string): string[] {
  if (source === 'BOOKING_COM') return [Flag.BOOKING_COM_DOUBLE_REMIT]
  return []
}

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

  const extra = sourceFlags(booking.source)
  if (extra.length > 0) {
    const existing = Array.isArray(calcData.flags) ? (calcData.flags as string[]) : []
    calcData.flags = [...existing, ...extra]
  }

  await db.calculation.upsert({
    where: { bookingId },
    create: { bookingId, ...calcData },
    update: calcData,
  })
}
