/**
 * VAT helpers. The levy base is the accommodation price NET of VAT
 * (Edinburgh guidance v2.1 p.3: "5% of the accommodation only portion of the
 * transaction, net of VAT"). Platform prices for VAT-registered hosts usually
 * include VAT, so amounts entered as VAT-inclusive are converted before storing.
 */
export const STANDARD_VAT_RATE_PERCENT = 20

/** Remove VAT from a VAT-inclusive amount in pence (rounded half-up to whole pence). */
export function excludeVat(inclusivePence: number, ratePercent = STANDARD_VAT_RATE_PERCENT): number {
  return Math.floor((inclusivePence * 100) / (100 + ratePercent) + 0.5)
}

/** Marker stored in rawImportRow when a file's amounts were VAT-inclusive. */
export const VAT_INCLUSIVE_IMPORT_MARKER = '__levydesk_amounts_include_vat'
