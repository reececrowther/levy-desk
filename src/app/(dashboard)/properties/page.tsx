import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata = { title: 'Properties' }

const COUNTRY_LABEL: Record<string, string> = {
  SCOTLAND: 'Scotland',
  WALES: 'Wales',
}

const TYPE_LABEL: Record<string, string> = {
  SELF_CATERING: 'Self-catering',
  BNB_GUEST_HOUSE: 'B&B / Guest house',
  HOTEL: 'Hotel',
  HOSTEL_DORM: 'Hostel dormitory',
  CAMPSITE: 'Campsite',
  OTHER: 'Other',
}

export default async function PropertiesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })

  if (!member) redirect('/account')

  const properties = await db.property.findMany({
    where: { workspaceId: member.workspaceId },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { bookings: true } },
    },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Properties</h1>
        <Button asChild size="sm">
          <Link href="/properties/new">Add property</Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 p-10 text-center">
          <p className="text-sm text-stone-500">No properties yet.</p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/properties/new">Add your first property</Link>
          </Button>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
              <th className="pb-2 font-medium">Property</th>
              <th className="pb-2 font-medium">Council</th>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 font-medium">Country</th>
              <th className="pb-2 text-right font-medium">Bookings</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="py-2.5 font-medium">{p.name}</td>
                <td className="py-2.5 capitalize text-stone-600">
                  {p.council.replace(/_/g, ' ')}
                </td>
                <td className="py-2.5 text-stone-600">{TYPE_LABEL[p.accommodationType] ?? p.accommodationType}</td>
                <td className="py-2.5">
                  <Badge variant="secondary">{COUNTRY_LABEL[p.country] ?? p.country}</Badge>
                </td>
                <td className="py-2.5 text-right text-stone-600">{p._count.bookings}</td>
                <td className="py-2.5 pl-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/properties/${p.id}/edit`}
                      className="text-xs text-stone-500 hover:text-stone-800"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/bookings?propertyId=${p.id}`}
                      className="text-xs text-stone-500 hover:text-stone-800"
                    >
                      View bookings →
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
