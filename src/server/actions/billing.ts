'use server'

import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { STRIPE_PRICES, type PlanKey } from '@/lib/billing-config'
import { requireWorkspace } from './auth-helpers'
import { db } from '@/lib/db'

async function getOrCreateStripeCustomer(workspaceId: string): Promise<string> {
  if (!stripe) throw new Error('Stripe is not configured — add STRIPE_SECRET_KEY to .env.local.')

  const workspace = await db.workspace.findUniqueOrThrow({ where: { id: workspaceId } })

  if (workspace.stripeCustomerId) return workspace.stripeCustomerId

  const customer = await stripe.customers.create({
    name: workspace.name,
    metadata: { workspaceId },
  })

  await db.workspace.update({
    where: { id: workspaceId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

export async function createCheckoutSession(plan: Exclude<PlanKey, 'FREE'>) {
  const { workspace } = await requireWorkspace()
  if (!workspace) throw new Error('No workspace found.')
  if (!stripe) throw new Error('Stripe is not configured — add STRIPE_SECRET_KEY to .env.local.')

  const priceId = STRIPE_PRICES[plan]
  if (!priceId) throw new Error(`Stripe price ID for plan "${plan}" is not configured.`)

  const customerId = await getOrCreateStripeCustomer(workspace.id)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/account?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/account`,
    metadata: { workspaceId: workspace.id, plan },
  })

  if (!session.url) throw new Error('Stripe did not return a checkout URL.')
  redirect(session.url)
}

export async function createBillingPortal() {
  const { workspace } = await requireWorkspace()
  if (!workspace) throw new Error('No workspace found.')
  if (!stripe) throw new Error('Stripe is not configured — add STRIPE_SECRET_KEY to .env.local.')
  if (!workspace.stripeCustomerId) throw new Error('No Stripe customer found for this workspace.')

  const session = await stripe.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/account`,
  })

  redirect(session.url)
}
