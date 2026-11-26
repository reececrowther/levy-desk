/**
 * Creates the three volume-tiered monthly prices that src/lib/billing-config.ts expects
 * (PRICE_TIERS) and prints the env vars to set.
 *
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/create-stripe-prices.ts          # test mode
 *   STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/create-stripe-prices.ts --live   # live mode
 *
 * It only creates new prices; old prices and any subscriptions are left alone.
 * Then set STRIPE_PRICE_OWNER / _AGENT / _BNB (Vercel for production) and redeploy.
 */
import Stripe from 'stripe'
import { PRICE_TIERS, PLAN_LIMITS, type PaidPlan } from '../src/lib/billing-config'

const key = process.env.STRIPE_SECRET_KEY ?? ''
if (!key.startsWith('sk_test_') && !(key.startsWith('sk_live_') && process.argv.includes('--live'))) {
  throw new Error('Set STRIPE_SECRET_KEY. Live keys also need --live, so production is never changed by accident.')
}
const stripe = new Stripe(key)

async function main() {
  for (const plan of ['OWNER', 'AGENT', 'BNB'] as PaidPlan[]) {
    const unit = PLAN_LIMITS[plan].unit
    const product = await stripe.products.create({
      name: `Levy Desk ${PLAN_LIMITS[plan].label}`,
      description: `Billed per ${unit} per month`,
      metadata: { plan },
    })
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'gbp',
      recurring: { interval: 'month' },
      billing_scheme: 'tiered',
      tiers_mode: 'volume',
      tiers: PRICE_TIERS[plan].map((t) => ({
        up_to: t.upTo ?? 'inf',
        unit_amount: t.unitPence,
        ...(t.flatPence ? { flat_amount: t.flatPence } : {}),
      })),
      metadata: { plan },
    })
    console.log(`STRIPE_PRICE_${plan}=${price.id}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
