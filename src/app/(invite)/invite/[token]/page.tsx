import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { acceptInvite } from '@/server/actions/workspace'

export const metadata = { title: 'Accept invitation — Levy Desk' }

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const invite = await db.workspaceInvite.findUnique({
    where: { token },
    include: { workspace: true },
  })

  if (!invite || invite.expiresAt < new Date()) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm space-y-4">
        <h1 className="text-xl font-semibold">Invitation not found</h1>
        <p className="text-sm text-stone-500">
          This invitation link has expired or is invalid. Ask the workspace owner to send a new invite.
        </p>
        <Button asChild className="w-full">
          <a href="/login">Go to sign in</a>
        </Button>
      </div>
    )
  }

  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/invite/${token}`)
  }

  const roleLabel = invite.role === 'ACCOUNTANT' ? 'read-only accountant' : 'admin'

  return (
    <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm space-y-4">
      <h1 className="text-xl font-semibold">You've been invited</h1>
      <p className="text-sm text-stone-600">
        You have been invited to join{' '}
        <span className="font-medium">{invite.workspace.name}</span> as a{' '}
        <span className="font-medium">{roleLabel}</span>.
      </p>
      {invite.role === 'ACCOUNTANT' && (
        <p className="text-xs text-stone-500">
          As an accountant, you will have read-only access to returns and the audit log.
        </p>
      )}
      <form
        action={async () => {
          'use server'
          const result = await acceptInvite(token)
          redirect(`/returns?workspace=${result.workspaceId}`)
        }}
      >
        <Button type="submit" className="w-full">
          Accept invitation
        </Button>
      </form>
      <p className="text-center text-xs text-stone-400">
        Signed in as {session.user.email}
      </p>
    </div>
  )
}
