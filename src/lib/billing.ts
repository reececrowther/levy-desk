import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { PLAN_LIMITS, type PlanKey } from '@/lib/billing-config'

/** Units a workspace is billed for: properties, or rooms for B&B / hotel. Never below 1. */
export async function billableUnits(workspaceId: string, plan: PlanKey): Promise<number> {
  if (PLAN_LIMITS[plan].unit === 'room') {
    const { _sum } = await db.property.aggregate({ where: { workspaceId }, _sum: { unitsOrRooms: true } })
    return Math.max(1, _sum.unitsOrRooms ?? 0)
  }
  return Math.max(1, await db.property.count({ where: { workspaceId } }))
}

/**
 * Keep the Stripe subscription quantity in step with the workspace's properties.
 * Never throws: a billing hiccup must not block saving a property.
 */
export async function syncSubscriptionQuantity(workspaceId: string): Promise<void> {
  try {
    if (!stripe) return
    const ws = await db.workspace.findUnique({ where: { id: workspaceId }, select: { plan: true, stripeSubscriptionId: true } })
    if (!ws?.stripeSubscriptionId || ws.plan === 'FREE') return
    const sub = await stripe.subscriptions.retrieve(ws.stripeSubscriptionId)
    const item = sub.items.data[0]
    if (!item) return
    const quantity = await billableUnits(workspaceId, ws.plan)
    if (item.quantity === quantity) return
    await stripe.subscriptions.update(sub.id, { items: [{ id: item.id, quantity }] })
  } catch (err) {
    console.error('syncSubscriptionQuantity failed', workspaceId, err)
  }
}
