import { describe, it, expect } from 'vitest'
import {
  mergeFlags,
  correctedExtrasForCleaningFee,
  correctedColumnMapping,
} from '../maintenance/data-fixes'

describe('mergeFlags', () => {
  it('keeps import-only flags, takes engine flags, drops the retired Booking.com flag', () => {
    expect(
      mergeFlags(
        ['BASE_IS_PAYOUT_NOT_GROSS', 'BOOKING_COM_DOUBLE_REMIT', 'AMBIGUITY_EDINBURGH_CAP_START'],
        ['UNVERIFIED_START_DATE'],
      ).sort(),
    ).toEqual(['BASE_IS_PAYOUT_NOT_GROSS', 'UNVERIFIED_START_DATE'])
  })

  it('does not duplicate flags', () => {
    expect(mergeFlags(['COMMISSION_UNKNOWN'], ['COMMISSION_UNKNOWN'])).toEqual(['COMMISSION_UNKNOWN'])
  })
})

describe('correctedExtrasForCleaningFee', () => {
  it('zeroes extras that equal the imported Airbnb cleaning fee', () => {
    expect(correctedExtrasForCleaningFee({ 'Cleaning Fee': '£60.00', Amount: '400' }, 6_000)).toBe(0)
  })

  it('matches other cleaning headers and comma formatting', () => {
    expect(correctedExtrasForCleaningFee({ 'Cleaning charge': '1,060.50' }, 106_050)).toBe(0)
  })

  it('leaves extras alone when they are not the cleaning fee', () => {
    expect(correctedExtrasForCleaningFee({ 'Cleaning Fee': '60', Parking: '20' }, 2_000)).toBeNull()
  })

  it('leaves manual bookings (no import row) alone', () => {
    expect(correctedExtrasForCleaningFee(null, 6_000)).toBeNull()
  })

  it('does nothing when extras are zero', () => {
    expect(correctedExtrasForCleaningFee({ 'Cleaning Fee': '0' }, 0)).toBeNull()
  })
})

describe('correctedColumnMapping', () => {
  it('removes a Cleaning Fee extras mapping', () => {
    expect(correctedColumnMapping({ extras: 'Cleaning Fee', checkIn: 'Start Date' })).toEqual({
      checkIn: 'Start Date',
    })
  })

  it('leaves other extras mappings alone', () => {
    expect(correctedColumnMapping({ extras: 'Parking', checkIn: 'Start Date' })).toBeNull()
  })
})
