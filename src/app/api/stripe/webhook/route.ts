import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

// Maps Stripe subscription status to a Levy Desk Plan value
function planFromMetadata(metadata: Stripe.Metadata): string | null {
  const plan = metadata.plan
  if (plan === 'OWNER' || plan === 'AGENT' || plan === 'BNB') return plan
  return null
}

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const workspaceId = session.metadata?.workspaceId
      const plan = planFromMetadata(session.metadata ?? {})
      if (workspaceId && plan && session.subscription) {
        await db.workspace.update({
          where: { id: workspaceId },
          data: {
            plan: plan as 'OWNER' | 'AGENT' | 'BNB',
            stripeSubscriptionId: session.subscription as string,
          },
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const isActive = sub.status === 'active' || sub.status === 'trialing'
      if (!isActive) {
        await db.workspace.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: 'FREE', stripeSubscriptionId: null },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      await db.workspace.updateMany({
        where: { stripeCustomerId: customerId },
        data: { plan: 'FREE', stripeSubscriptionId: null },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
