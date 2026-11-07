/**
 * Pure helpers for one-off data corrections after rule fixes.
 * No database access here, so they can be unit tested.
 */
import { Flag } from '../../levy/flags'
import { parseCurrencyToPence } from '../importers/validator'

/**
 * Flags that come from import validation rather than the rules engine.
 * A recalculation must keep these, otherwise unresolved exceptions vanish.
 */
export const IMPORT_ONLY_FLAGS: readonly string[] = [
  Flag.BASE_IS_PAYOUT_NOT_GROSS,
  Flag.COMMISSION_UNKNOWN,
]

/** Flags that are retired and must be dropped on recalculation. */
export const RETIRED_FLAGS: readonly string[] = [Flag.BOOKING_COM_DOUBLE_REMIT, Flag.AMBIGUITY_EDINBURGH_CAP_START]

/** Engine flags + any import-only flags already on the calculation, minus retired flags. */
export function mergeFlags(previous: readonly string[], fromEngine: readonly string[]): string[] {
  const kept = previous.filter((f) => IMPORT_ONLY_FLAGS.includes(f))
  return [...new Set([...fromEngine, ...kept])].filter((f) => !RETIRED_FLAGS.includes(f))
}

const CLEANING_HEADER = /clean/i

/**
 * If a booking's deducted extras are exactly the cleaning fee from its imported row,
 * return the corrected extras (0). Otherwise return null (leave unchanged).
 *
 * Edinburgh guidance v2.1 p.4: standard cleaning is part of the levy base.
 */
export function correctedExtrasForCleaningFee(
  rawImportRow: unknown,
  extrasPence: number,
): number | null {
  if (extrasPence <= 0 || !rawImportRow || typeof rawImportRow !== 'object') return null
  for (const [header, value] of Object.entries(rawImportRow as Record<string, unknown>)) {
    if (!CLEANING_HEADER.test(header) || typeof value !== 'string') continue
    const pence = parseCurrencyToPence(value)
    if (pence !== null && Math.abs(pence) === extrasPence) return 0
  }
  return null
}

/**
 * One-off cleaning fee recorded in an imported row (pence), or 0.
 * Used as the booking's per-stay fee: it is part of the guest-paid total and,
 * under a night cap, charged in full (Edinburgh v2.1 p.8).
 */
export function cleaningFeeFromImportRow(rawImportRow: unknown): number {
  if (!rawImportRow || typeof rawImportRow !== 'object') return 0
  for (const [header, value] of Object.entries(rawImportRow as Record<string, unknown>)) {
    if (!CLEANING_HEADER.test(header) || typeof value !== 'string') continue
    const pence = parseCurrencyToPence(value)
    if (pence !== null && pence > 0) return pence
  }
  return 0
}

/** Remove a cleaning-fee column from a saved mapping's `extras` field. Returns null if unchanged. */
export function correctedColumnMapping(
  mapping: unknown,
): Record<string, string> | null {
  if (!mapping || typeof mapping !== 'object') return null
  const m = mapping as Record<string, string>
  if (typeof m.extras !== 'string' || !CLEANING_HEADER.test(m.extras)) return null
  const { extras: _removed, ...rest } = m
  void _removed
  return rest
}
