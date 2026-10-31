import { describe, it, expect } from 'vitest'
import {
  parseQuarterKey,
  dateToQuarterKey,
  scotlandDeadline,
  availableQuarters,
} from '../quarters'

describe('parseQuarterKey', () => {
  it('parses Q1', () => {
    const q = parseQuarterKey('2026-Q1')
    expect(q.label).toBe('Q1 2026')
    expect(q.periodStart.toISOString()).toBe('2026-01-01T00:00:00.000Z')
    expect(q.periodEnd.toISOString()).toBe('2026-03-31T23:59:59.000Z')
  })

  it('parses Q2', () => {
    const q = parseQuarterKey('2026-Q2')
    expect(q.periodStart.toISOString()).toBe('2026-04-01T00:00:00.000Z')
    expect(q.periodEnd.toISOString()).toBe('2026-06-30T23:59:59.000Z')
  })

  it('parses Q3', () => {
    const q = parseQuarterKey('2026-Q3')
    expect(q.periodStart.toISOString()).toBe('2026-07-01T00:00:00.000Z')
    expect(q.periodEnd.toISOString()).toBe('2026-09-30T23:59:59.000Z')
  })

  it('parses Q4', () => {
    const q = parseQuarterKey('2026-Q4')
    expect(q.periodStart.toISOString()).toBe('2026-10-01T00:00:00.000Z')
    expect(q.periodEnd.toISOString()).toBe('2026-12-31T23:59:59.000Z')
  })

  it('throws on invalid quarter number', () => {
    expect(() => parseQuarterKey('2026-Q5')).toThrow('Invalid quarter')
    expect(() => parseQuarterKey('2026-Q0')).toThrow('Invalid quarter')
  })
})

describe('dateToQuarterKey', () => {
  it('maps January to Q1', () => {
    expect(dateToQuarterKey(new Date('2026-01-15'))).toBe('2026-Q1')
  })

  it('maps March to Q1', () => {
    expect(dateToQuarterKey(new Date('2026-03-31'))).toBe('2026-Q1')
  })

  it('maps April to Q2', () => {
    expect(dateToQuarterKey(new Date('2026-04-01'))).toBe('2026-Q2')
  })

  it('maps October to Q4', () => {
    expect(dateToQuarterKey(new Date('2026-10-20'))).toBe('2026-Q4')
  })

  it('maps December to Q4', () => {
    expect(dateToQuarterKey(new Date('2026-12-31'))).toBe('2026-Q4')
  })
})

describe('scotlandDeadline', () => {
  it('Q1 (Jan-Mar) deadline is 30 April', () => {
    const d = scotlandDeadline(parseQuarterKey('2026-Q1'))
    expect(d.toISOString().slice(0, 10)).toBe('2026-04-30')
  })

  it('Q2 (Apr-Jun) deadline is 31 July', () => {
    const d = scotlandDeadline(parseQuarterKey('2026-Q2'))
    expect(d.toISOString().slice(0, 10)).toBe('2026-07-31')
  })

  it('Q3 (Jul-Sep) deadline is 31 October', () => {
    const d = scotlandDeadline(parseQuarterKey('2026-Q3'))
    expect(d.toISOString().slice(0, 10)).toBe('2026-10-31')
  })

  it('Q4 (Oct-Dec) deadline is 31 January next year', () => {
    const d = scotlandDeadline(parseQuarterKey('2026-Q4'))
    expect(d.toISOString().slice(0, 10)).toBe('2027-01-31')
  })

  it('Q4 deadline does not overflow into February', () => {
    const d = scotlandDeadline(parseQuarterKey('2024-Q4'))
    expect(d.toISOString().slice(0, 10)).toBe('2025-01-31')
  })
})

describe('availableQuarters', () => {
  it('returns quarters in reverse chronological order', () => {
    const qs = availableQuarters('2026-01-01')
    for (let i = 0; i < qs.length - 1; i++) {
      expect(qs[i]!.periodStart > qs[i + 1]!.periodStart).toBe(true)
    }
  })

  it('includes the current quarter', () => {
    const qs = availableQuarters('2024-01-01')
    const today = new Date()
    const currentKey = dateToQuarterKey(today)
    expect(qs.some((q) => q.key === currentKey)).toBe(true)
  })

  it('starts from the quarter containing the earliest date', () => {
    const qs = availableQuarters('2026-07-15')
    const keys = qs.map((q) => q.key)
    expect(keys).not.toContain('2026-Q2')
    expect(keys).toContain('2026-Q3')
  })
})
