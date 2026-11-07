/**
 * Admin-only data maintenance: recalculate every booking with the current rules
 * and apply one-off corrections from the November 2026 Edinburgh fixes.
 *
 * - Cleaning fees that were deducted as extras on import are put back in the base.
 * - Saved column mappings that map a cleaning column to `extras` are corrected.
 * - Calculations are recomputed (drops the retired BOOKING_COM_DOUBLE_REMIT flag
 *   and the removed 6% Edinburgh rule), keeping import-only exception flags.
 * - DRAFT (unlocked) returns get fresh totals; net payable excludes VAT.
 * - Bookings in LOCKED periods and locked returns are never modified. They are
 *   reported with the figures they would have, so affected hosts can be told.
 *
 * Preview mode reads only. Apply mode writes.
 */
import { db } from '@/lib/db'
import { calculate } from '@/levy/calculator'
import { SCHEME_RULES } from '@/levy/rules/index'
import { sumReturnTotals } from '@/levy/return-totals'
import { toEngineBooking, toEngineProperty, calculationToDb } from '@/lib/levy-adapter'
import {
  mergeFlags,
  correctedExtrasForCleaningFee,
  correctedColumnMapping,
} from '@/lib/maintenance/data-fixes'
import type { Prisma } from '@prisma/client'
import { bookingInPeriod } from '@/lib/return-period'

export interface ReturnImpact {
  id: string
  workspaceName: string
  ownerEmail: string | null
  council: string
  periodStart: string
  periodEnd: string
  status: string
  locked: boolean
  storedNetPayablePence: number
  correctedNetPayablePence: number
  storedLevyPence: number
  correctedLevyPence: number
}

export interface MaintenanceReport {
  mode: 'preview' | 'applied'
  bookingsScanned: number
  bookingsInLockedPeriods: number
  cleaningFeeCorrections: number
  calculationsChanged: number
  /** Sum of (new levy − old levy) across unlocked bookings */
  levyChangePence: number
  mappingsCorrected: number
  draftReturns: ReturnImpact[]
  lockedReturns: ReturnImpact[]
}

const iso = (d: Date) => d.toISOString().slice(0, 10)

export async function recalculateAll(opts: { apply: boolean; adminUserId: string }): Promise<MaintenanceReport> {
  const bookings = await db.booking.findMany({
    include: {
      calculation: true,
      property: { include: { workspace: { include: { members: { include: { user: true }, orderBy: { createdAt: 'asc' } } } } } },
    },
  })
  const returns = await db.levyReturn.findMany({ include: { workspace: { include: { members: { include: { user: true }, orderBy: { createdAt: 'asc' } } } } } })
  const lockedReturns = returns.filter((r) => r.lockedAt !== null)

  const inPeriod = (
    b: { checkIn: Date; checkOut: Date; property: { council: string } },
    r: { periodStart: Date; periodEnd: Date },
  ) => bookingInPeriod(b.property.council, b.checkIn, b.checkOut, r.periodStart, r.periodEnd)

  const isLocked = (b: (typeof bookings)[number]) =>
    lockedReturns.some(
      (r) => r.workspaceId === b.property.workspaceId && r.council === b.property.council && inPeriod(b, r),
    )

  type NewCalc = ReturnType<typeof calculationToDb> & { flags: string[] }
  const newCalcs = new Map<string, { calc: NewCalc; locked: boolean; newExtras: number | null }>()

  let bookingsInLockedPeriods = 0
  let cleaningFeeCorrections = 0
  let calculationsChanged = 0
  let levyChangePence = 0

  for (const b of bookings) {
    const locked = isLocked(b)
    if (locked) bookingsInLockedPeriods++

    const newExtras = correctedExtrasForCleaningFee(b.rawImportRow, b.extrasPence)
    // Build the engine booking from the corrected row so one-off fees are derived correctly.
    const engineBooking = toEngineBooking({ ...b, extrasPence: newExtras ?? b.extrasPence })
    const engineProperty = { ...toEngineProperty(b.property), vatRegistered: b.property.workspace.vatRegistered }
    const result = calculate(engineBooking, engineProperty, { rules: SCHEME_RULES })
    const calc = calculationToDb(result) as NewCalc
    calc.flags = mergeFlags(b.calculation?.flags ?? [], result.flags)

    newCalcs.set(b.id, { calc, locked, newExtras })
    if (locked) continue

    if (newExtras !== null) cleaningFeeCorrections++
    const old = b.calculation
    const changed =
      !old ||
      old.levyPence !== calc.levyPence ||
      old.vatOnLevyPence !== calc.vatOnLevyPence ||
      old.retentionPence !== calc.retentionPence ||
      old.basePence !== calc.basePence ||
      old.nightsCharged !== calc.nightsCharged ||
      old.schemeRuleId !== calc.schemeRuleId ||
      [...old.flags].sort().join() !== [...calc.flags].sort().join()
    if (changed) {
      calculationsChanged++
      levyChangePence += calc.levyPence - (old?.levyPence ?? 0)
    }
  }

  const mappings = await db.columnMapping.findMany()
  const mappingFixes = mappings
    .map((m) => ({ id: m.id, workspaceId: m.workspaceId, fixed: correctedColumnMapping(m.mapping) }))
    .filter((m) => m.fixed !== null)

  const impactFor = (r: (typeof returns)[number]): ReturnImpact => {
    const lines = bookings
      .filter(
        (b) =>
          b.property.workspaceId === r.workspaceId &&
          b.property.council === r.council &&
          b.status === 'CONFIRMED' &&
          inPeriod(b, r),
      )
      .map((b) => newCalcs.get(b.id)!.calc)
    const t = sumReturnTotals(lines)
    return {
      id: r.id,
      workspaceName: r.workspace.name,
      ownerEmail: r.workspace.members[0]?.user.email ?? null,
      council: r.council,
      periodStart: iso(r.periodStart),
      periodEnd: iso(r.periodEnd),
      status: r.status,
      locked: r.lockedAt !== null,
      storedNetPayablePence: r.netPayablePence,
      correctedNetPayablePence: t.netPayablePence,
      storedLevyPence: r.totalLevyPence,
      correctedLevyPence: t.totalLevyPence,
    }
  }

  const draftImpacts = returns.filter((r) => r.lockedAt === null).map(impactFor)
  const lockedImpacts = lockedReturns
    .map(impactFor)
    .filter((i) => i.storedNetPayablePence !== i.correctedNetPayablePence || i.storedLevyPence !== i.correctedLevyPence)

  if (opts.apply) {
    const touchedWorkspaces = new Set<string>()

    for (const b of bookings) {
      const entry = newCalcs.get(b.id)!
      if (entry.locked) continue
      if (entry.newExtras !== null) {
        await db.booking.update({ where: { id: b.id }, data: { extrasPence: entry.newExtras } })
      }
      await db.calculation.upsert({
        where: { bookingId: b.id },
        create: { bookingId: b.id, ...entry.calc },
        update: entry.calc,
      })
      touchedWorkspaces.add(b.property.workspaceId)
    }

    for (const m of mappingFixes) {
      await db.columnMapping.update({ where: { id: m.id }, data: { mapping: m.fixed as Prisma.InputJsonValue } })
      touchedWorkspaces.add(m.workspaceId)
    }

    for (const d of draftImpacts) {
      const r = returns.find((x) => x.id === d.id)!
      const lines = bookings
        .filter((b) => b.property.workspaceId === r.workspaceId && b.property.council === r.council && b.status === 'CONFIRMED' && inPeriod(b, r))
        .map((b) => newCalcs.get(b.id)!.calc)
      const t = sumReturnTotals(lines)
      await db.levyReturn.update({
        where: { id: r.id },
        data: {
          totalLevyPence: t.totalLevyPence,
          totalVatOnLevyPence: t.totalVatOnLevyPence,
          totalRetentionPence: t.totalRetentionPence,
          netPayablePence: t.netPayablePence,
        },
      })
      touchedWorkspaces.add(r.workspaceId)
    }

    for (const workspaceId of touchedWorkspaces) {
      await db.auditLog.create({
        data: {
          workspaceId,
          userId: opts.adminUserId,
          action: 'MAINTENANCE_RECALCULATE_2026_11',
          entityType: 'Workspace',
          entityId: workspaceId,
          after: {
            reason:
              'Edinburgh guidance v2.1 fixes: cleaning fees included in levy base, VAT excluded from council payment, retired Booking.com flag, removed hypothetical 6% rule. Locked periods untouched.',
          } as Prisma.InputJsonValue,
        },
      })
    }
  }

  return {
    mode: opts.apply ? 'applied' : 'preview',
    bookingsScanned: bookings.length,
    bookingsInLockedPeriods,
    cleaningFeeCorrections,
    calculationsChanged,
    levyChangePence,
    mappingsCorrected: mappingFixes.length,
    draftReturns: draftImpacts,
    lockedReturns: lockedImpacts,
  }
}
