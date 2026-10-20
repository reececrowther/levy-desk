import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { flagDescription } from '@/lib/flag-descriptions'
import { formatPence } from '@/lib/format'
import { ExceptionRow } from '@/components/exception-row'

export const metadata = { title: 'Exceptions' }

export default async function ExceptionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!member) redirect('/account')

  // Fetch all calculations with flags, excluding bookings with all flags acknowledged
  const calculations = await db.calculation.findMany({
    where: {
      flags: { isEmpty: false },
      booking: {
        property: { workspaceId: member.workspaceId },
        status: 'CONFIRMED',
      },
    },
    include: {
      booking: {
        include: { property: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Filter to only show bookings with at least one unacknowledged flag
  const exceptions = calculations
    .map((calc) => {
      const acknowledged = new Set(calc.booking.acknowledgedFlags)
      const active = calc.flags.filter((f) => !acknowledged.has(f))
      return { calc, active }
    })
    .filter(({ active }) => active.length > 0)

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Exceptions</h1>
          <p className="mt-1 text-sm text-stone-500">
            Bookings that need attention before you can file a return.
          </p>
        </div>
        {exceptions.length > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {exceptions.length} bookings
          </span>
        )}
      </div>

      {exceptions.length === 0 ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-6 py-8 text-center">
          <p className="text-sm font-medium text-green-800">No exceptions — all bookings are ready to file.</p>
          <Link
            href="/returns/new"
            className="mt-3 inline-block rounded-md bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800"
          >
            Generate a return
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {exceptions.map(({ calc, active }) => (
            <div key={calc.id} className="rounded-lg border border-stone-200 bg-white">
              {/* Booking header */}
              <div className="flex items-start justify-between border-b border-stone-100 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {calc.booking.property.name}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {calc.booking.checkIn.toLocaleDateString('en-GB')} to{' '}
                    {calc.booking.checkOut.toLocaleDateString('en-GB')}
                    {calc.booking.externalRef && (
                      <span className="ml-2 font-mono">{calc.booking.externalRef}</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-stone-900">
                    {formatPence(calc.levyPence)} levy
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">{calc.booking.source}</p>
                </div>
              </div>

              {/* Active flags */}
              <div className="divide-y divide-stone-50 px-5">
                {active.map((flag) => (
                  <ExceptionRow
                    key={flag}
                    bookingId={calc.booking.id}
                    flag={flag}
                    description={flagDescription(flag)}
                    booking={{
                      guestPaidGrossPence: calc.booking.guestPaidGrossPence,
                      adults: calc.booking.adults,
                      under18s: calc.booking.under18s,
                      commissionPence: calc.booking.commissionPence ?? 0,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
