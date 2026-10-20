'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireWorkspace } from './auth-helpers'
import { PLAN_LIMITS } from '@/lib/billing-config'

const ClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  contactEmail: z.string().email().optional().or(z.literal('')),
})

async function requireAgentWorkspace(workspaceId?: string) {
  const { workspace, role } = await requireWorkspace(workspaceId)
  if (!workspace) throw new Error('No workspace found.')

  const limits = PLAN_LIMITS[workspace.plan as keyof typeof PLAN_LIMITS]
  if (limits.maxClients === 0) {
    throw new Error(
      `Client management is available on the Agent plan. ` +
      `Upgrade your plan on the Account page.`,
    )
  }
  return { workspace, role }
}

export async function createClient(workspaceId: string, input: z.infer<typeof ClientSchema>) {
  const { workspace } = await requireAgentWorkspace(workspaceId)
  const data = ClientSchema.parse(input)

  const client = await db.client.create({
    data: {
      workspaceId: workspace.id,
      name: data.name,
      contactEmail: data.contactEmail || null,
    },
  })

  revalidatePath('/clients')
  return client
}

export async function updateClient(clientId: string, input: z.infer<typeof ClientSchema>) {
  const client = await db.client.findUniqueOrThrow({ where: { id: clientId } })
  await requireAgentWorkspace(client.workspaceId)
  const data = ClientSchema.parse(input)

  const updated = await db.client.update({
    where: { id: clientId },
    data: {
      name: data.name,
      contactEmail: data.contactEmail || null,
    },
  })

  revalidatePath('/clients')
  revalidatePath(`/clients/${clientId}`)
  return updated
}

export async function deleteClient(clientId: string) {
  const client = await db.client.findUniqueOrThrow({ where: { id: clientId } })
  await requireAgentWorkspace(client.workspaceId)

  await db.client.delete({ where: { id: clientId } })
  revalidatePath('/clients')
}
