import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Clients' }

export default async function ClientsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })

  if (!member) redirect('/account')

  const clients = await db.client.findMany({
    where: { workspaceId: member.workspaceId },
    include: { _count: { select: { properties: true } } },
    orderBy: { name: 'asc' },
  })

  const canManageClients = member.workspace.plan === 'AGENT'

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Clients</h1>
        {canManageClients && (
          <Button asChild size="sm">
            <Link href="/clients/new">Add client</Link>
          </Button>
        )}
      </div>

      {!canManageClients && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Client management is available on the Agent plan.{' '}
          <Link href="/account" className="font-medium underline">
            Upgrade on the Account page.
          </Link>
        </div>
      )}

      {clients.length === 0 ? (
        <p className="text-sm text-stone-500">
          {canManageClients ? 'No clients yet. Add your first client to get started.' : 'No clients.'}
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs font-medium text-stone-600 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Contact email</th>
                <th className="px-4 py-3 text-right">Properties</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium">{client.name}</td>
                  <td className="px-4 py-3 text-stone-500">{client.contactEmail ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-stone-500">
                    {client._count.properties}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-stone-600 hover:text-stone-900 underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
