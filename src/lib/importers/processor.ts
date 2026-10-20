import Papa from 'papaparse'
import { db } from '@/lib/db'
import { calculate } from '@/levy/calculator'
import { SCHEME_RULES } from '@/levy/rules/index'
import { Flag } from '@/levy/flags'
import { toEngineBooking, toEngineProperty, calculationToDb } from '@/lib/levy-adapter'
import { validateRow } from './validator'
import type { ColumnMappingDef, TargetField } from './presets'
import type { BookingSource, BookingStatus } from '@prisma/client'

export type RowResult = {
  rowIndex: number
  status: 'imported' | 'skipped' | 'error'
  bookingId?: string
  externalRef?: string
  checkIn?: string
  error?: string
}

export type ProcessResult = {
  totalRows: number
  importedRows: number
  skippedRows: number
  errorRows: number
  results: RowResult[]
}

async function recalculate(bookingId: string, extraFlags: string[] = []): Promise<void> {
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

  if (extraFlags.length > 0) {
    const existing = Array.isArray(calcData.flags) ? (calcData.flags as string[]) : []
    calcData.flags = [...existing, ...extraFlags]
  }

  await db.calculation.upsert({
    where: { bookingId },
    create: { bookingId, ...calcData },
    update: calcData,
  })
}

export async function processImportBatch(
  batchId: string,
  mapping: ColumnMappingDef,
): Promise<ProcessResult> {
  const batch = await db.importBatch.findUniqueOrThrow({
    where: { id: batchId },
    include: { property: { include: { workspace: true } } },
  })

  // Mark as processing
  await db.importBatch.update({
    where: { id: batchId },
    data: { status: 'PROCESSING' },
  })

  const { property } = batch
  const source = batch.source as BookingSource

  const { data: rawRows } = Papa.parse<Record<string, string>>(batch.rawContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  })

  const results: RowResult[] = []
  let importedRows = 0
  let skippedRows = 0
  let errorRows = 0

  for (let i = 0; i < rawRows.length; i++) {
    const rawRow = rawRows[i]!
    const rowIndex = i + 1 // 1-indexed (header is row 0)

    // Apply mapping: extract target field values
    const mapped: Partial<Record<TargetField, string>> = {}
    for (const [targetField, csvHeader] of Object.entries(mapping)) {
      if (csvHeader && rawRow[csvHeader] !== undefined) {
        mapped[targetField as TargetField] = rawRow[csvHeader]
      }
    }

    const validation = validateRow(
      mapped,
      property.council,
      property.country,
    )

    if (!validation.ok) {
      results.push({
        rowIndex,
        status: 'error',
        error: validation.errors.join('; '),
      })
      errorRows++
      continue
    }

    const { data: row } = validation

    // Deduplication: same property + source + externalRef
    if (row.externalRef) {
      const existing = await db.booking.findUnique({
        where: {
          propertyId_source_externalRef: {
            propertyId: property.id,
            source,
            externalRef: row.externalRef,
          },
        },
      })
      if (existing) {
        results.push({
          rowIndex,
          status: 'skipped',
          bookingId: existing.id,
          externalRef: row.externalRef,
          checkIn: row.checkIn,
        })
        skippedRows++
        continue
      }
    }

    // Create booking
    let booking: { id: string }
    try {
      booking = await db.booking.create({
        data: {
          propertyId: property.id,
          source,
          externalRef: row.externalRef,
          bookedAt: new Date(row.bookedAt),
          firstPaymentAt: row.firstPaymentAt ? new Date(row.firstPaymentAt) : null,
          checkIn: new Date(row.checkIn),
          checkOut: new Date(row.checkOut),
          adults: row.adults,
          under18s: row.under18s,
          guestPaidGrossPence: row.guestPaidGrossPence,
          extrasPence: row.extrasPence,
          commissionPence: row.commissionPence,
          payoutPence: row.payoutPence,
          status: row.status as BookingStatus,
          rawImportRow: rawRow as Record<string, string>,
        },
      })
    } catch (err) {
      // Unique constraint violation (concurrent duplicate) — treat as skip
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Unique constraint') || msg.includes('unique constraint')) {
        results.push({
          rowIndex,
          status: 'skipped',
          externalRef: row.externalRef,
          checkIn: row.checkIn,
        })
        skippedRows++
        continue
      }
      results.push({
        rowIndex,
        status: 'error',
        externalRef: row.externalRef,
        checkIn: row.checkIn,
        error: 'Database error: ' + msg.slice(0, 120),
      })
      errorRows++
      continue
    }

    // Add Booking.com double-remit flag for levy councils
    const extraFlags: string[] =
      source === 'BOOKING_COM' ? [Flag.BOOKING_COM_DOUBLE_REMIT] : []

    // Row-level flags from validation
    extraFlags.push(...row.flags)

    try {
      await recalculate(booking.id, extraFlags)
    } catch (err) {
      // Calculation failure should not block the import; booking is still created
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`Levy calculation failed for booking ${booking.id}: ${msg}`)
    }

    results.push({
      rowIndex,
      status: 'imported',
      bookingId: booking.id,
      externalRef: row.externalRef,
      checkIn: row.checkIn,
    })
    importedRows++
  }

  // Persist results
  await db.importBatch.update({
    where: { id: batchId },
    data: {
      status: 'COMPLETE',
      totalRows: rawRows.length,
      importedRows,
      skippedRows,
      errorRows,
      results: results as object[],
    },
  })

  return {
    totalRows: rawRows.length,
    importedRows,
    skippedRows,
    errorRows,
    results,
  }
}
