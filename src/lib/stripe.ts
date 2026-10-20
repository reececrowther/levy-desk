import Stripe from 'stripe'

// Stripe client is null when STRIPE_SECRET_KEY is not set — billing features
// degrade gracefully; plan enforcement still works without Stripe.
export const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null
