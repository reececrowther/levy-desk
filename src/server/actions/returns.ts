'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireWorkspace } from './auth-helpers'
import { parseQuarterKey, scotlandDeadline } from '@/lib/quarters'
import { sendNilReturnReminder } from '@/lib/email/reminders'
import type { Prisma } from '@prisma/client'

const VALID_COUNCILS = [
  'edinburgh', 'glasgow', 'aberdeen', 'stirling', 'west_dunbartonshire', 'highland', 'cardiff',
] as const

const GenerateSchema = z.object({
  council: z.enum(VALID_COUNCILS),
  quarterKey: z.string().regex(/^\d{4}-Q[1-4]$/),
})

export type GenerateState = { error?: string }

export async function generateReturn(
  _prev: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  const { workspace, user } = await requireWorkspace()
  if (!workspace) return { error: 'No workspace found.' }

  const parsed = GenerateSchema.safeParse({
    council: formData.get('council'),
    quarterKey: formData.get('quarterKey'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }

  const { council, quarterKey } = parsed.data
  const quarter = parseQuarterKey(quarterKey)

  // Check for existing return
  const existing = await db.levyReturn.findFirst({
    where: {
      workspaceId: workspace.id,
      council,
      periodStart: quarter.periodStart,
      periodEnd: quarter.periodEnd,
    },
  })
  if (existing) {
    redirect(`/returns/${existing.id}`)
  }

  // Fetch all confirmed bookings with calculations for this council + period
  const bookings = await db.booking.findMany({
    where: {
      property: { workspaceId: workspace.id, council },
      checkIn: { gte: quarter.periodStart, lte: quarter.periodEnd },
      status: 'CONFIRMED',
    },
    include: { calculation: true },
  })

  // Aggregate totals — only bookings that have a completed calculation
  let totalLevyPence = 0
  let totalVatOnLevyPence = 0
  let totalRetentionPence = 0

  for (const b of bookings) {
    if (!b.calculation) continue
    totalLevyPence += b.calculation.levyPence
    totalVatOnLevyPence += b.calculation.vatOnLevyPence
    totalRetentionPence += b.calculation.retentionPence
  }

  const netPayablePence = totalLevyPence + totalVatOnLevyPence - totalRetentionPence

  const levyReturn = await db.levyReturn.create({
    data: {
      workspaceId: workspace.id,
      council,
      periodStart: quarter.periodStart,
      periodEnd: quarter.periodEnd,
      totalLevyPence,
      totalVatOnLevyPence,
      totalRetentionPence,
      netPayablePence,
      status: 'DRAFT',
    },
  })

  await db.auditLog.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      action: 'GENERATE_RETURN',
      entityType: 'LevyReturn',
      entityId: levyReturn.id,
      after: { council, quarterKey, totalLevyPence, netPayablePence } as Prisma.InputJsonValue,
    },
  })

  redirect(`/returns/${levyReturn.id}`)
}

export async function lockReturn(returnId: string) {
  const { workspace, user } = await requireWorkspace()
  if (!workspace) throw new Error('No workspace.')

  const levyReturn = await db.levyReturn.findFirst({
    where: { id: returnId, workspaceId: workspace.id },
  })
  if (!levyReturn) throw new Error('Return not found.')
  if (levyReturn.lockedAt) throw new Error('Return is already locked.')

  await db.levyReturn.update({
    where: { id: returnId },
    data: { status: 'READY', lockedAt: new Date() },
  })

  await db.auditLog.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      action: 'LOCK_RETURN',
      entityType: 'LevyReturn',
      entityId: returnId,
      after: { lockedAt: new Date().toISOString() } as Prisma.InputJsonValue,
    },
  })

  revalidatePath(`/returns/${returnId}`)
}

export async function markReturnFiled(returnId: string, filedRef?: string) {
  const { workspace, user } = await requireWorkspace()
  if (!workspace) throw new Error('No workspace.')

  const levyReturn = await db.levyReturn.findFirst({
    where: { id: returnId, workspaceId: workspace.id },
  })
  if (!levyReturn) throw new Error('Return not found.')
  if (!levyReturn.lockedAt) throw new Error('Return must be locked before marking as filed.')
  if (levyReturn.status === 'FILED' || levyReturn.status === 'PAID') {
    throw new Error('Return is already filed.')
  }

  await db.levyReturn.update({
    where: { id: returnId },
    data: { status: 'FILED', filedRef: filedRef || null },
  })

  await db.auditLog.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      action: 'MARK_FILED',
      entityType: 'LevyReturn',
      entityId: returnId,
      after: { filedRef: filedRef ?? null } as Prisma.InputJsonValue,
    },
  })

  revalidatePath(`/returns/${returnId}`)
}

export async function markReturnPaid(returnId: string) {
  const { workspace, user } = await requireWorkspace()
  if (!workspace) throw new Error('No workspace.')

  const levyReturn = await db.levyReturn.findFirst({
    where: { id: returnId, workspaceId: workspace.id },
  })
  if (!levyReturn) throw new Error('Return not found.')
  if (levyReturn.status !== 'FILED') throw new Error('Return must be filed before marking as paid.')

  await db.levyReturn.update({
    where: { id: returnId },
    data: { status: 'PAID' },
  })

  await db.auditLog.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      action: 'MARK_PAID',
      entityType: 'LevyReturn',
      entityId: returnId,
    },
  })

  revalidatePath(`/returns/${returnId}`)
}

export async function unlockReturn(returnId: string) {
  const { workspace, user } = await requireWorkspace()
  if (!workspace) throw new Error('No workspace.')

  const levyReturn = await db.levyReturn.findFirst({
    where: { id: returnId, workspaceId: workspace.id },
  })
  if (!levyReturn) throw new Error('Return not found.')
  if (!levyReturn.lockedAt) return

  await db.levyReturn.update({
    where: { id: returnId },
    data: { status: 'DRAFT', lockedAt: null },
  })

  await db.auditLog.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      action: 'UNLOCK_RETURN',
      entityType: 'LevyReturn',
      entityId: returnId,
    },
  })

  revalidatePath(`/returns/${returnId}`)
}

export async function sendNilReminder(returnId: string) {
  const { workspace, user } = await requireWorkspace()
  if (!workspace) throw new Error('No workspace.')

  const levyReturn = await db.levyReturn.findFirst({
    where: { id: returnId, workspaceId: workspace.id },
  })
  if (!levyReturn) throw new Error('Return not found.')

  const quarter = parseQuarterKey(
    `${levyReturn.periodStart.getUTCFullYear()}-Q${Math.floor(levyReturn.periodStart.getUTCMonth() / 3) + 1}`,
  )
  const deadline = scotlandDeadline(quarter)

  await sendNilReturnReminder({
    toEmail: user.email,
    workspaceName: workspace.name,
    council: levyReturn.council,
    quarter,
    deadline,
  })

  revalidatePath(`/returns/${returnId}`)
}
