'use server'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user as { id: string; email: string; name?: string | null }
}

export async function requireWorkspace(workspaceId?: string) {
  const user = await requireUser()

  if (workspaceId) {
    const member = await db.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
      include: { workspace: true },
    })
    if (!member) throw new Error('Access denied')
    return { user, workspace: member.workspace, role: member.role }
  }

  // Return the first workspace the user belongs to
  const member = await db.workspaceMember.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!member) return { user, workspace: null, role: null }
  return { user, workspace: member.workspace, role: member.role }
}
