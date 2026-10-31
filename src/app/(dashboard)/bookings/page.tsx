import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WorkingDrawer } from '@/components/working-drawer'
import { formatPence } from '@/lib/format'
import type { Calculation } from '@prisma/client'

export const metadata = { title: 'Bookings' }

const SOURCE_LABEL: Record<string, string> = {
  AIRBNB: 'Airbnb',
  BOOKING_COM: 'Booking.com',
  VRBO: 'Vrbo',
  DIRECT: 'Direct',
  SOFTWARE: 'Software',
  OTHER: 'Other',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'warning'> = {
  CONFIRMED: 'success' as 'default',
  CANCELLED: 'destructive',
  NO_SHOW: 'warning',
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const params = await searchParams
  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) redirect('/account')

  const bookings = await db.booking.findMany({
    where: {
      property: {
        workspaceId: member.workspaceId,
        ...(params.propertyId ? { id: params.propertyId } : {}),
      },
    },
    include: {
      property: true,
      calculation: true,
    },
    orderBy: [{ checkIn: 'desc' }],
    take: 200,
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Bookings</h1>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/imports/new">Import from file</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/bookings/new">Add booking</Link>
          </Button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 p-10 text-center">
          <p className="text-sm text-stone-500">No bookings yet.</p>
          <p className="mt-1 text-xs text-stone-400">Add bookings manually or import a CSV / Excel file from your platform.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/imports/new">Import from file</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/bookings/new">Add manually</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                <th className="pb-2 font-medium">Property</th>
                <th className="pb-2 font-medium">Check-in</th>
                <th className="pb-2 font-medium">Check-out</th>
                <th className="pb-2 font-medium">Source</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 text-right font-medium">Gross</th>
                <th className="pb-2 text-right font-medium">Levy</th>
                <th className="pb-2 font-medium">Flags</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const calc = b.calculation as Calculation | null
                return (
                  <tr key={b.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-2.5 font-medium">{b.property.name}</td>
                    <td className="py-2.5 font-mono text-xs">
                      {b.checkIn.toISOString().slice(0, 10)}
                    </td>
                    <td className="py-2.5 font-mono text-xs">
                      {b.checkOut.toISOString().slice(0, 10)}
                    </td>
                    <td className="py-2.5 text-stone-600">
                      {SOURCE_LABEL[b.source] ?? b.source}
                    </td>
                    <td className="py-2.5">
                      <Badge variant={STATUS_VARIANT[b.status] ?? 'secondary'} className="text-xs">
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs">
                      {formatPence(b.guestPaidGrossPence)}
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs font-medium">
                      {calc ? formatPence(calc.levyPence) : '—'}
                    </td>
                    <td className="py-2.5">
                      {calc && calc.flags.length > 0 && (
                        <Badge variant="warning" className="text-xs">
                          {calc.flags.length} flag{calc.flags.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/bookings/${b.id}/edit`}
                          className="text-xs text-stone-500 hover:text-stone-800"
                        >
                          Edit
                        </Link>
                        {calc && <WorkingDrawer calculation={calc} />}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
