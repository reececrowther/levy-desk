import { describe, it, expect } from 'vitest'
import { monthlyPricePence } from '../billing-config'

describe('plan prices (volume tiers, matched to Visitor Levy App, 26 Nov 2026)', () => {
  it('Owner: £6 per property up to 10, then £5 per property for all of them', () => {
    expect(monthlyPricePence('OWNER', 1)).toBe(600)
    expect(monthlyPricePence('OWNER', 3)).toBe(1800)
    expect(monthlyPricePence('OWNER', 10)).toBe(6000)
    expect(monthlyPricePence('OWNER', 11)).toBe(5500)
  })

  it('Agent: £29 minimum covers up to 7 properties, then £4 each', () => {
    expect(monthlyPricePence('AGENT', 1)).toBe(2900)
    expect(monthlyPricePence('AGENT', 7)).toBe(2900)
    expect(monthlyPricePence('AGENT', 8)).toBe(3200)
    expect(monthlyPricePence('AGENT', 30)).toBe(12000)
  })

  it('B&B: £1.50 per room up to 20 rooms, then £1.20 per room', () => {
    expect(monthlyPricePence('BNB', 8)).toBe(1200)
    expect(monthlyPricePence('BNB', 20)).toBe(3000)
    expect(monthlyPricePence('BNB', 25)).toBe(3000)
  })

  it('never charges for zero units', () => {
    expect(monthlyPricePence('OWNER', 0)).toBe(600)
  })
})
