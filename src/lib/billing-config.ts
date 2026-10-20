// Billing plan limits and Stripe price configuration.
// Price IDs are read from env vars so they can differ between environments.

export type PlanKey = 'FREE' | 'OWNER' | 'AGENT' | 'BNB'

export const PLAN_LIMITS: Record<PlanKey, {
  label: string
  maxProperties: number | null  // null = unlimited
  maxClients: number | null     // null = unlimited; 0 = clients not supported
  pricePerUnitPencePerMonth: number | null
  minMonthlyPence: number | null
}> = {
  FREE: {
    label: 'Free',
    maxProperties: 1,
    maxClients: 0,
    pricePerUnitPencePerMonth: null,
    minMonthlyPence: null,
  },
  OWNER: {
    label: 'Owner',
    maxProperties: null,
    maxClients: 0,
    pricePerUnitPencePerMonth: 800,   // £8 per unit per month
    minMonthlyPence: null,
  },
  AGENT: {
    label: 'Agent',
    maxProperties: null,
    maxClients: null,
    pricePerUnitPencePerMonth: 500,   // £5 per unit per month
    minMonthlyPence: 9900,            // minimum £99/month
  },
  BNB: {
    label: 'B&B / Hotel',
    maxProperties: null,
    maxClients: 0,
    pricePerUnitPencePerMonth: 2500,  // £25 per property per month
    minMonthlyPence: null,
  },
}

// Stripe price IDs — set in .env.local; null means Stripe is not configured
export const STRIPE_PRICES: Record<Exclude<PlanKey, 'FREE'>, string | null> = {
  OWNER: process.env.STRIPE_PRICE_OWNER ?? null,
  AGENT: process.env.STRIPE_PRICE_AGENT ?? null,
  BNB:   process.env.STRIPE_PRICE_BNB   ?? null,
}
