'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireUser } from './auth-helpers'
import { sendInviteEmail } from '@/lib/email/invite'

const WorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['OWNER', 'AGENT', 'ACCOUNTANT']),
  vatRegistered: z.boolean(),
  vatNumber: z.string().optional(),
})

export async function createWorkspace(input: z.infer<typeof WorkspaceSchema>) {
  const user = await requireUser()
  const data = WorkspaceSchema.parse(input)

  const workspace = await db.workspace.create({
    data: {
      ...data,
      members: {
        create: { userId: user.id, role: 'OWNER' },
      },
    },
  })

  revalidatePath('/dashboard')
  return workspace
}

export async function updateWorkspace(
  id: string,
  input: Partial<z.infer<typeof WorkspaceSchema>>,
) {
  const member = await requireWorkspaceMember(id)
  if (member.role !== 'OWNER' && member.role !== 'ADMIN') {
    throw new Error('Only workspace owners and admins can update workspace settings.')
  }
  const data = WorkspaceSchema.partial().parse(input)

  const workspace = await db.workspace.update({
    where: { id },
    data,
  })

  revalidatePath('/account')
  return workspace
}

export async function requireWorkspaceMember(workspaceId: string) {
  const user = await requireUser()
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
  })
  if (!member) throw new Error('Not a member of this workspace')
  return member
}

// ─── Invite flow ─────────────────────────────────────────────────────────────

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ACCOUNTANT', 'ADMIN']).default('ACCOUNTANT'),
})

export async function inviteMember(workspaceId: string, input: z.infer<typeof InviteSchema>) {
  const user = await requireUser()
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
  })
  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    throw new Error('Only workspace owners and admins can send invites.')
  }

  const data = InviteSchema.parse(input)

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const workspace = await db.workspace.findUniqueOrThrow({ where: { id: workspaceId } })

  const invite = await db.workspaceInvite.create({
    data: {
      workspaceId,
      email: data.email,
      role: data.role,
      expiresAt,
    },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://levydesk.co.uk'
  await sendInviteEmail({
    toEmail: data.email,
    workspaceName: workspace.name,
    inviterName: user.name ?? user.email,
    role: data.role,
    inviteUrl: `${baseUrl}/invite/${invite.token}`,
  })

  revalidatePath('/account')
  return invite
}

export async function acceptInvite(token: string) {
  const user = await requireUser()

  const invite = await db.workspaceInvite.findUnique({ where: { token } })
  if (!invite) throw new Error('Invite not found or already used.')
  if (invite.expiresAt < new Date()) throw new Error('This invite has expired.')

  await db.$transaction(async (tx) => {
    await tx.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId: user.id } },
      update: { role: invite.role },
      create: { workspaceId: invite.workspaceId, userId: user.id, role: invite.role },
    })
    await tx.workspaceInvite.delete({ where: { token } })
  })

  revalidatePath('/dashboard')
  return { workspaceId: invite.workspaceId }
}

export async function removeMember(workspaceId: string, userId: string) {
  const currentUser = await requireUser()
  const currentMember = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: currentUser.id } },
  })
  if (!currentMember || currentMember.role !== 'OWNER') {
    throw new Error('Only workspace owners can remove members.')
  }
  if (userId === currentUser.id) throw new Error('You cannot remove yourself.')

  await db.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId, userId } },
  })

  revalidatePath('/account')
}

export async function revokeInvite(inviteId: string) {
  const user = await requireUser()
  const invite = await db.workspaceInvite.findUniqueOrThrow({ where: { id: inviteId } })
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId: user.id } },
  })
  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    throw new Error('Only workspace owners and admins can revoke invites.')
  }

  await db.workspaceInvite.delete({ where: { id: inviteId } })
  revalidatePath('/account')
}
