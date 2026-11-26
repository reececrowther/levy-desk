// Billing plan limits and Stripe price configuration.
// Price IDs are read from env vars so they can differ between environments.
//
// Paid plans are billed per unit (subscription quantity = billable units, see
// src/lib/billing.ts). Each Stripe price must be a VOLUME-tiered recurring price
// matching PRICE_TIERS; scripts/create-stripe-prices.ts creates them.
// Matched to Visitor Levy App's published pricing on 26 Nov 2026.

export type PlanKey = 'FREE' | 'OWNER' | 'AGENT' | 'BNB'
export type PaidPlan = Exclude<PlanKey, 'FREE'>

/** Volume tiers: the tier that fits the total quantity prices every unit. */
export type PriceTier = { upTo: number | null; unitPence: number; flatPence?: number }

export const PLAN_LIMITS: Record<PlanKey, {
  label: string
  maxProperties: number | null  // null = unlimited
  maxClients: number | null     // null = unlimited; 0 = clients not supported
  /** What one billed unit is */
  unit: 'property' | 'room' | null
}> = {
  FREE: { label: 'Free', maxProperties: 1, maxClients: 0, unit: null },
  OWNER: { label: 'Owner', maxProperties: null, maxClients: 0, unit: 'property' },
  AGENT: { label: 'Agent', maxProperties: null, maxClients: null, unit: 'property' },
  BNB: { label: 'B&B / Hotel', maxProperties: null, maxClients: 0, unit: 'room' },
}

export const PRICE_TIERS: Record<PaidPlan, PriceTier[]> = {
  // £6 per property, £5 per property once you have more than 10
  OWNER: [
    { upTo: 10, unitPence: 600 },
    { upTo: null, unitPence: 500 },
  ],
  // £4 per property with a £29 monthly minimum (7 properties or fewer cost £29)
  AGENT: [
    { upTo: 7, unitPence: 0, flatPence: 2900 },
    { upTo: null, unitPence: 400 },
  ],
  // £1.50 per room, £1.20 per room once you have more than 20
  BNB: [
    { upTo: 20, unitPence: 150 },
    { upTo: null, unitPence: 120 },
  ],
}

/** New paid subscriptions start with roughly one quarter free. */
export const FREE_TRIAL_DAYS = 90

/** Monthly price in pence for `units` on a plan, as Stripe's volume tiers charge it. */
export function monthlyPricePence(plan: PaidPlan, units: number): number {
  const qty = Math.max(1, units)
  const tier = PRICE_TIERS[plan].find((t) => t.upTo === null || qty <= t.upTo)!
  return (tier.flatPence ?? 0) + tier.unitPence * qty
}

// Stripe price IDs — set in .env.local; null means Stripe is not configured
export const STRIPE_PRICES: Record<PaidPlan, string | null> = {
  OWNER: process.env.STRIPE_PRICE_OWNER ?? null,
  AGENT: process.env.STRIPE_PRICE_AGENT ?? null,
  BNB:   process.env.STRIPE_PRICE_BNB   ?? null,
}
