import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createWorkspace, updateWorkspace, inviteMember, revokeInvite, removeMember } from '@/server/actions/workspace'
import { createCheckoutSession, createBillingPortal } from '@/server/actions/billing'
import { PLAN_LIMITS, type PlanKey } from '@/lib/billing-config'

export const metadata = { title: 'Account' }

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { upgraded } = await searchParams

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })

  if (!member) {
    return (
      <div className="p-8 max-w-lg space-y-6">
        <h1 className="text-lg font-semibold">Create your account</h1>
        <CreateWorkspaceForm />
      </div>
    )
  }

  const { workspace } = member
  const canManage = member.role === 'OWNER' || member.role === 'ADMIN'

  const appUrl = process.env.NEXTAUTH_URL ?? 'https://levydesk.co.uk'

  const [members, pendingInvites] = await Promise.all([
    db.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    }),
    db.workspaceInvite.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const plan = workspace.plan as PlanKey
  const planInfo = PLAN_LIMITS[plan]
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY
  const hasSubscription = !!workspace.stripeSubscriptionId

  return (
    <div className="p-8 max-w-2xl space-y-10">
      <h1 className="text-lg font-semibold">Account settings</h1>

      {upgraded && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Your plan has been upgraded. Thank you!
        </div>
      )}

      {/* Workspace details */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-stone-700 border-b border-stone-200 pb-1">
          Workspace details
        </h2>
        <UpdateWorkspaceForm workspace={workspace} />
      </section>

      {/* Billing */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-stone-700 border-b border-stone-200 pb-1">
          Plan and billing
        </h2>

        <div className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3">
          <div>
            <p className="font-medium text-sm">{planInfo.label} plan</p>
            <p className="text-xs text-stone-500 mt-0.5">
              {planInfo.maxProperties === null
                ? 'Unlimited properties'
                : `Up to ${planInfo.maxProperties} ${planInfo.maxProperties === 1 ? 'property' : 'properties'}`}
              {planInfo.maxClients !== 0
                ? planInfo.maxClients === null
                  ? ' · Unlimited clients'
                  : ` · Up to ${planInfo.maxClients} clients`
                : ''}
            </p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-0.5 text-xs font-medium text-stone-700">
            {plan}
          </span>
        </div>

        {stripeConfigured ? (
          <div className="flex flex-wrap gap-2">
            {plan === 'FREE' && (
              <>
                <UpgradeButton plan="OWNER" label="Upgrade to Owner (£8/unit/month)" />
                <UpgradeButton plan="AGENT" label="Upgrade to Agent (£5/unit/month, min £99)" />
                <UpgradeButton plan="BNB" label="Upgrade to B&B / Hotel (£25/property/month)" />
              </>
            )}
            {hasSubscription && (
              <form action={async () => { 'use server'; await createBillingPortal() }}>
                <Button type="submit" variant="outline" size="sm">
                  Manage subscription
                </Button>
              </form>
            )}
          </div>
        ) : (
          <p className="text-xs text-stone-400">
            Stripe is not configured. Add{' '}
            <code className="text-xs bg-stone-100 px-1 rounded">STRIPE_SECRET_KEY</code> to{' '}
            <code className="text-xs bg-stone-100 px-1 rounded">.env.local</code> to enable billing.
          </p>
        )}
      </section>

      {/* Team members */}
      {canManage && (
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-stone-700 border-b border-stone-200 pb-1">
            Team members
          </h2>

          <div className="overflow-hidden rounded-lg border border-stone-200">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-stone-200">
                {members.map((m) => (
                  <tr key={m.id} className="bg-white">
                    <td className="px-4 py-3">
                      <p className="font-medium">{m.user.name ?? m.user.email}</p>
                      {m.user.name && (
                        <p className="text-xs text-stone-500">{m.user.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-500 capitalize">
                      {m.role.toLowerCase()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {m.userId !== session.user.id && m.role !== 'OWNER' && (
                        <form
                          action={async () => {
                            'use server'
                            await removeMember(workspace.id, m.userId)
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pending invites */}
          {pendingInvites.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                Pending invites
              </p>
              {pendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-md border border-dashed border-stone-300 px-3 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{inv.email}</span>
                      <span className="text-xs text-stone-400 capitalize">
                        {inv.role.toLowerCase()}
                      </span>
                      <span className="text-xs text-stone-400">
                        · expires {inv.expiresAt.toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <a
                      href={`${appUrl}/invite/${inv.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate font-mono text-xs text-stone-400 hover:text-stone-600 underline"
                    >
                      {appUrl}/invite/{inv.token}
                    </a>
                  </div>
                  <form
                    action={async () => {
                      'use server'
                      await revokeInvite(inv.id)
                    }}
                  >
                    <button type="submit" className="text-xs text-red-600 hover:text-red-800">
                      Revoke
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

          {/* Invite form */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              Invite team member
            </p>
            <InviteForm workspaceId={workspace.id} />
          </div>
        </section>
      )}
    </div>
  )
}

function UpgradeButton({ plan, label }: { plan: Exclude<PlanKey, 'FREE'>; label: string }) {
  return (
    <form action={async () => { 'use server'; await createCheckoutSession(plan) }}>
      <Button type="submit" size="sm">
        {label}
      </Button>
    </form>
  )
}

function InviteForm({ workspaceId }: { workspaceId: string }) {
  return (
    <>
    <form
      action={async (fd: FormData) => {
        'use server'
        await inviteMember(workspaceId, {
          email: fd.get('email') as string,
          role: (fd.get('role') as 'ACCOUNTANT' | 'ADMIN') || 'ACCOUNTANT',
        })
      }}
      className="flex gap-2 items-end flex-wrap"
    >
      <div className="space-y-1.5 flex-1 min-w-48">
        <Label htmlFor="invite-email">Email address</Label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          required
          placeholder="accountant@firm.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="invite-role">Role</Label>
        <select
          id="invite-role"
          name="role"
          className="flex h-9 rounded-md border border-stone-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
        >
          <option value="ACCOUNTANT">Accountant (read-only)</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <Button type="submit" size="sm">
        Send invite
      </Button>
    </form>
    <p className="text-xs text-stone-400">
      An invitation email will be sent if email is configured. You can also copy the invite link from the list above.
    </p>
    </>
  )
}

function CreateWorkspaceForm() {
  return (
    <form
      action={async (fd: FormData) => {
        'use server'
        await createWorkspace({
          name: fd.get('name') as string,
          type: fd.get('type') as 'OWNER' | 'AGENT' | 'ACCOUNTANT',
          vatRegistered: fd.get('vatRegistered') === 'true',
          vatNumber: (fd.get('vatNumber') as string) || undefined,
        })
        redirect('/dashboard')
      }}
      className="space-y-4"
    >
      <Field id="name" label="Business / trading name">
        <Input id="name" name="name" required />
      </Field>

      <div className="space-y-1.5">
        <Label htmlFor="type">Account type</Label>
        <select
          name="type"
          id="type"
          className="flex h-9 w-full rounded-md border border-stone-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
        >
          <option value="OWNER">Property owner (2-20 units)</option>
          <option value="AGENT">Letting agent (20-200 units)</option>
          <option value="ACCOUNTANT">Accountant / bookkeeper</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>VAT registration</Label>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="vatRegistered" name="vatRegistered" value="true" />
          <Label htmlFor="vatRegistered" className="font-normal">
            This business is VAT-registered
          </Label>
        </div>
      </div>

      <Field id="vatNumber" label="VAT number (optional)">
        <Input id="vatNumber" name="vatNumber" placeholder="GB123456789" />
      </Field>

      <Button type="submit" className="w-full">
        Create account
      </Button>
    </form>
  )
}

function UpdateWorkspaceForm({
  workspace,
}: {
  workspace: {
    id: string
    name: string
    type: string
    vatRegistered: boolean
    vatNumber: string | null
  }
}) {
  return (
    <form
      action={async (fd: FormData) => {
        'use server'
        await updateWorkspace(workspace.id, {
          name: fd.get('name') as string,
          vatRegistered: fd.get('vatRegistered') === 'true',
          vatNumber: (fd.get('vatNumber') as string) || undefined,
        })
        redirect('/account')
      }}
      className="space-y-4"
    >
      <Field id="name" label="Business / trading name">
        <Input id="name" name="name" defaultValue={workspace.name} required />
      </Field>

      <div className="space-y-1.5">
        <Label>VAT registration</Label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="vatRegistered"
            name="vatRegistered"
            value="true"
            defaultChecked={workspace.vatRegistered}
          />
          <Label htmlFor="vatRegistered" className="font-normal">
            This business is VAT-registered
          </Label>
        </div>
      </div>

      <Field id="vatNumber" label="VAT number (optional)">
        <Input
          id="vatNumber"
          name="vatNumber"
          defaultValue={workspace.vatNumber ?? ''}
          placeholder="GB123456789"
        />
      </Field>

      <Button type="submit">Save changes</Button>
    </form>
  )
}

function Field({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
