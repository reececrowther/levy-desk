import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseQuarterKey, availableQuarters, scotlandDeadline, formatQuarterPeriod } from '@/lib/quarters'
import { formatPence } from '@/lib/format'
import { bookingPeriodWhere } from '@/lib/return-period'

export const metadata = { title: 'Owner Statement' }

const SOURCE_LABEL: Record<string, string> = {
  AIRBNB: 'Airbnb',
  BOOKING_COM: 'Booking.com',
  VRBO: 'Vrbo',
  DIRECT: 'Direct',
  SOFTWARE: 'Software',
  OTHER: 'Other',
}

export default async function StatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ propertyId: string }>
  searchParams: Promise<{ quarter?: string }>
}) {
  const { propertyId } = await params
  const { quarter: quarterParam } = await searchParams

  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!member) redirect('/account')

  const property = await db.property.findFirst({
    where: { id: propertyId, workspaceId: member.workspaceId },
  })
  if (!property) notFound()

  const quarters = availableQuarters(property.createdAt.toISOString().slice(0, 10))
  const selectedKey = quarterParam ?? quarters[0]?.key

  let quarter = quarters[0]
  if (selectedKey) {
    try {
      quarter = parseQuarterKey(selectedKey)
    } catch {
      quarter = quarters[0]
    }
  }

  const bookings = quarter
    ? await db.booking.findMany({
        where: {
          propertyId: property.id,
          ...bookingPeriodWhere(property.council, quarter.periodStart, quarter.periodEnd),
          status: 'CONFIRMED',
        },
        include: { calculation: true },
        orderBy: { checkIn: 'asc' },
      })
    : []

  const rows = bookings.filter((b) => b.calculation)

  const totalGrossPence = rows.reduce((s, b) => s + b.guestPaidGrossPence, 0)
  const totalLevyPence = rows.reduce((s, b) => s + (b.calculation?.levyPence ?? 0), 0)
  const totalRetentionPence = rows.reduce((s, b) => s + (b.calculation?.retentionPence ?? 0), 0)
  const netPayablePence = totalLevyPence - totalRetentionPence

  const deadline = quarter && property.country === 'SCOTLAND' ? scotlandDeadline(quarter) : null
  const addressParts = [property.addressLine1, property.town, property.postcode].filter(Boolean)
  const propertyAddress = addressParts.length > 0 ? addressParts.join(', ') : property.postcode

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Link href="/properties" className="text-sm text-stone-500 hover:text-stone-700">
          ← Properties
        </Link>
        <h1 className="mt-2 text-lg font-semibold">Owner Statement</h1>
        <p className="text-sm text-stone-500">{property.name}</p>
      </div>

      {/* Quarter selector */}
      <form method="GET" className="flex items-center gap-3">
        <label htmlFor="quarter" className="text-sm font-medium text-stone-700">
          Quarter
        </label>
        <select
          id="quarter"
          name="quarter"
          defaultValue={selectedKey}
          className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          {quarters.map((q) => (
            <option key={q.key} value={q.key}>
              {q.label} ({formatQuarterPeriod(q)})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700"
        >
          View
        </button>
        {quarter && (
          <a
            href={`/api/properties/${property.id}/statement?quarter=${quarter.key}`}
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
          >
            Download PDF
          </a>
        )}
      </form>

      {/* Statement card */}
      {quarter && (
        <div className="rounded-lg border border-stone-200 bg-white">
          {/* Statement header */}
          <div className="border-b border-stone-100 px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-stone-900">Owner Statement</h2>
                <p className="mt-0.5 text-sm text-stone-600">{property.name}</p>
                <p className="text-xs text-stone-400">{propertyAddress}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-stone-900">
                  {quarter.label}
                </p>
                <p className="text-xs text-stone-400">{formatQuarterPeriod(quarter)}</p>
                <p className="mt-1 text-xs text-stone-400">
                  Prepared by {member.workspace.name}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border-b border-stone-100 px-6 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
              Summary
            </h3>
            <div className="space-y-2">
              <SummaryRow label="Confirmed bookings" value={String(rows.length)} />
              <SummaryRow label="Total guest-paid gross" value={formatPence(totalGrossPence)} />
              <SummaryRow label="Total visitor levy due" value={formatPence(totalLevyPence)} />
              <SummaryRow
                label="Retention kept by host (2%)"
                value={formatPence(totalRetentionPence)}
              />
              <div className="mt-2 border-t border-stone-100 pt-2">
                <SummaryRow
                  label="Net levy payable to council"
                  value={formatPence(netPayablePence)}
                  bold
                />
              </div>
              {deadline && (
                <p className="pt-1 text-xs text-stone-400">
                  Filing deadline:{' '}
                  {deadline.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Booking table */}
          <div className="px-6 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
              Booking detail
            </h3>
            {rows.length === 0 ? (
              <p className="text-sm text-stone-400 italic">
                No confirmed bookings in this period.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-left text-xs text-stone-400">
                      <th className="pb-2 font-medium">Ref</th>
                      <th className="pb-2 font-medium">Check-in</th>
                      <th className="pb-2 font-medium">Check-out</th>
                      <th className="pb-2 font-medium">Nts</th>
                      <th className="pb-2 font-medium">Source</th>
                      <th className="pb-2 text-right font-medium">Gross</th>
                      <th className="pb-2 text-right font-medium">Levy</th>
                      <th className="pb-2 text-right font-medium">Retention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {rows.map((b) => (
                      <tr key={b.id} className="text-xs">
                        <td className="py-2 font-mono text-stone-400">
                          {b.externalRef ?? '—'}
                        </td>
                        <td className="py-2">{b.checkIn.toISOString().slice(0, 10)}</td>
                        <td className="py-2">{b.checkOut.toISOString().slice(0, 10)}</td>
                        <td className="py-2">{b.calculation!.nightsCharged}</td>
                        <td className="py-2 text-stone-500">
                          {SOURCE_LABEL[b.source] ?? b.source}
                        </td>
                        <td className="py-2 text-right font-mono">
                          {formatPence(b.guestPaidGrossPence)}
                        </td>
                        <td className="py-2 text-right font-mono font-medium">
                          {formatPence(b.calculation!.levyPence)}
                        </td>
                        <td className="py-2 text-right font-mono text-stone-500">
                          {formatPence(b.calculation!.retentionPence)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-stone-200">
                    <tr className="text-xs font-semibold">
                      <td colSpan={5} className="pt-2">Totals</td>
                      <td className="pt-2 text-right font-mono">{formatPence(totalGrossPence)}</td>
                      <td className="pt-2 text-right font-mono">{formatPence(totalLevyPence)}</td>
                      <td className="pt-2 text-right font-mono text-stone-500">
                        {formatPence(totalRetentionPence)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="border-t border-stone-100 px-6 py-3">
            <p className="text-xs text-stone-400 italic">
              This statement is for information only. Levy Desk does not file returns or make
              payments on your behalf.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? 'font-semibold text-stone-900' : 'text-stone-500'}`}>
        {label}
      </span>
      <span className={`font-mono text-sm ${bold ? 'font-semibold text-stone-900' : 'text-stone-700'}`}>
        {value}
      </span>
    </div>
  )
}
