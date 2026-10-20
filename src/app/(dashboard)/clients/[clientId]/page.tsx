import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateClient, deleteClient } from '@/server/actions/clients'

export const metadata = { title: 'Client' }

export default async function ClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { clientId } = await params

  const client = await db.client.findUnique({
    where: { id: clientId },
    include: {
      workspace: { include: { members: true } },
      properties: { orderBy: { name: 'asc' } },
    },
  })

  if (!client) notFound()

  const isMember = client.workspace.members.some((m) => m.userId === session.user.id)
  if (!isMember) redirect('/clients')

  const canEdit = client.workspace.plan === 'AGENT'

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/clients" className="text-sm text-stone-500 hover:text-stone-700">
            Clients
          </Link>
          <h1 className="text-lg font-semibold mt-1">{client.name}</h1>
        </div>
      </div>

      {/* Edit form */}
      {canEdit && (
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Details</h2>
          <form
            action={async (fd: FormData) => {
              'use server'
              await updateClient(clientId, {
                name: fd.get('name') as string,
                contactEmail: (fd.get('contactEmail') as string) || undefined,
              })
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Client name</Label>
              <Input id="name" name="name" defaultValue={client.name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={client.contactEmail ?? ''}
              />
            </div>
            <Button type="submit" size="sm">Save changes</Button>
          </form>
        </section>
      )}

      {/* Properties */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-stone-700">Properties</h2>
          <Button asChild size="sm" variant="outline">
            <Link href={`/properties/new?clientId=${clientId}`}>Add property</Link>
          </Button>
        </div>

        {client.properties.length === 0 ? (
          <p className="text-sm text-stone-500">No properties for this client yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-xs font-medium text-stone-600 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Council</th>
                  <th className="px-4 py-3 text-left">Postcode</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {client.properties.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-stone-500">{p.council}</td>
                    <td className="px-4 py-3 text-stone-500">{p.postcode}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/properties/${p.id}`}
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
      </section>

      {/* Danger zone */}
      {canEdit && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-red-700">Danger zone</h2>
          <p className="text-xs text-stone-500">
            Deleting a client removes the client record but does not delete their properties or bookings.
          </p>
          <form
            action={async () => {
              'use server'
              await deleteClient(clientId)
              redirect('/clients')
            }}
          >
            <Button type="submit" variant="destructive" size="sm">
              Delete client
            </Button>
          </form>
        </section>
      )}
    </div>
  )
}
