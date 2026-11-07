import { describe, it, expect } from 'vitest'
import { bookingInPeriod } from '../return-period'
import { parseQuarterKey } from '../quarters'

const d = (s: string) => new Date(`${s}T00:00:00Z`)
const Q3 = parseQuarterKey('2026-Q3')
const Q4 = parseQuarterKey('2026-Q4')
const Q1 = parseQuarterKey('2027-Q1')

describe('Edinburgh: stays belong to the check-out quarter (guidance v2.1 p.13)', () => {
  it('28 Dec 2026 → 3 Jan 2027 belongs to Q1 2027, not Q4 2026', () => {
    expect(bookingInPeriod('edinburgh', d('2026-12-28'), d('2027-01-03'), Q4.periodStart, Q4.periodEnd)).toBe(false)
    expect(bookingInPeriod('edinburgh', d('2026-12-28'), d('2027-01-03'), Q1.periodStart, Q1.periodEnd)).toBe(true)
  })

  it('stay within one quarter is unaffected', () => {
    expect(bookingInPeriod('edinburgh', d('2026-11-01'), d('2026-11-05'), Q4.periodStart, Q4.periodEnd)).toBe(true)
  })
})

describe('Transition: stays checking in before 1 Oct 2026 stay in the check-in quarter (already filed)', () => {
  it('28 Sep → 3 Oct 2026 is in Q3 only, so it is never reported twice', () => {
    expect(bookingInPeriod('edinburgh', d('2026-09-28'), d('2026-10-03'), Q3.periodStart, Q3.periodEnd)).toBe(true)
    expect(bookingInPeriod('edinburgh', d('2026-09-28'), d('2026-10-03'), Q4.periodStart, Q4.periodEnd)).toBe(false)
  })
})

describe('Wales keeps the check-in basis (unverified)', () => {
  it('Cardiff 30 Jun → 2 Jul 2027 is in Q2', () => {
    const Q2 = parseQuarterKey('2027-Q2')
    expect(bookingInPeriod('cardiff', d('2027-06-30'), d('2027-07-02'), Q2.periodStart, Q2.periodEnd)).toBe(true)
  })
})
