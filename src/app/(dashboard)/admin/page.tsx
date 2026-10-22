import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const metadata = { title: 'Admin' }

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.email !== process.env.ADMIN_EMAIL) redirect('/dashboard')

  const leads = await db.calculatorLead.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const workspaces = await db.workspace.findMany({
    include: {
      members: {
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: {
          properties: true,
          members: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalWorkspaces = workspaces.length
  const totalProperties = workspaces.reduce((sum, w) => sum + w._count.properties, 0)
  const totalUsers = new Set(workspaces.flatMap((w) => w.members.map((m) => m.userId))).size

  const planCounts = workspaces.reduce(
    (acc, w) => {
      acc[w.plan] = (acc[w.plan] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-lg font-semibold">Admin</h1>
        <p className="text-sm text-stone-500">Platform overview — admin only</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Workspaces" value={totalWorkspaces} />
        <StatCard label="Unique users" value={totalUsers} />
        <StatCard label="Properties" value={totalProperties} />
        <StatCard label="Calculator leads" value={leads.length} />
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <p className="text-xs text-stone-500">Plans</p>
          <div className="mt-2 space-y-1">
            {(['FREE', 'OWNER', 'AGENT', 'BNB'] as const).map((plan) => (
              <div key={plan} className="flex items-center justify-between text-sm">
                <PlanBadge plan={plan} />
                <span className="font-semibold tabular-nums text-stone-900">
                  {planCounts[plan] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workspace table */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">All workspaces</h2>
        {workspaces.length === 0 ? (
          <p className="text-sm text-stone-500">No workspaces yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-stone-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-xs font-medium uppercase tracking-wide text-stone-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Workspace</th>
                    <th className="px-4 py-3 text-left">Owner email</th>
                    <th className="px-4 py-3 text-left">Plan</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-right">Properties</th>
                    <th className="px-4 py-3 text-right">Members</th>
                    <th className="px-4 py-3 text-left">Date joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {workspaces.map((w) => {
                    const owner = w.members.find((m) => m.role === 'OWNER') ?? w.members[0]
                    return (
                      <tr key={w.id} className="hover:bg-stone-50">
                        <td className="px-4 py-3 font-medium text-stone-900">{w.name}</td>
                        <td className="px-4 py-3 text-stone-600">{owner?.user.email ?? '—'}</td>
                        <td className="px-4 py-3">
                          <PlanBadge plan={w.plan} />
                        </td>
                        <td className="px-4 py-3 capitalize text-stone-500">
                          {w.type.toLowerCase()}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-stone-700">
                          {w._count.properties}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-stone-700">
                          {w._count.members}
                        </td>
                        <td className="px-4 py-3 text-stone-500">
                          {w.createdAt.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Per-workspace member breakdown */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">Members per workspace</h2>
        <div className="space-y-4">
          {workspaces.map((w) => (
            <details key={w.id} className="rounded-lg border border-stone-200 bg-white">
              <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3 text-sm font-medium text-stone-900 hover:bg-stone-50">
                <span>{w.name}</span>
                <span className="text-xs text-stone-500">{w.members.length} member{w.members.length !== 1 ? 's' : ''}</span>
              </summary>
              <div className="border-t border-stone-100">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-xs text-stone-500">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Email</th>
                      <th className="px-4 py-2 text-left font-medium">Role</th>
                      <th className="px-4 py-2 text-left font-medium">Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {w.members.map((m) => (
                      <tr key={m.id}>
                        <td className="px-4 py-2 text-stone-700">{m.user.email}</td>
                        <td className="px-4 py-2 capitalize text-stone-500">
                          {m.role.toLowerCase()}
                        </td>
                        <td className="px-4 py-2 text-stone-400">
                          {m.createdAt.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      </div>
      {/* Calculator leads */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">Calculator leads</h2>
        {leads.length === 0 ? (
          <p className="text-sm text-stone-500">No leads yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-stone-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-xs font-medium uppercase tracking-wide text-stone-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Council</th>
                    <th className="px-4 py-3 text-right">Levy estimate</th>
                    <th className="px-4 py-3 text-left">Captured</th>
                    <th className="px-4 py-3 text-left">Emailed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 text-stone-800">{lead.email}</td>
                      <td className="px-4 py-3 capitalize text-stone-600">
                        {lead.council.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-stone-900">
                        £{(lead.levyPence / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-stone-500">
                        {lead.createdAt.toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {lead.emailedAt ? (
                          <span className="text-green-700">&#10003; Sent</span>
                        ) : (
                          <span className="text-stone-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-stone-900">{value}</p>
    </div>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const colours: Record<string, string> = {
    FREE: 'bg-stone-100 text-stone-600',
    OWNER: 'bg-blue-100 text-blue-700',
    AGENT: 'bg-violet-100 text-violet-700',
    BNB: 'bg-orange-100 text-orange-700',
  }
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${colours[plan] ?? colours.FREE}`}
    >
      {plan}
    </span>
  )
}
