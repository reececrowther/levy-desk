import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatPence } from '@/lib/format'
import { parseQuarterKey, scotlandDeadline, formatQuarterPeriod } from '@/lib/quarters'
import { ReturnActions } from './return-actions'

export default async function ReturnPage({ params }: { params: Promise<{ returnId: string }> }) {
  const { returnId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!member) redirect('/login')

  const levyReturn = await db.levyReturn.findFirst({
    where: { id: returnId, workspaceId: member.workspaceId },
  })
  if (!levyReturn) notFound()

  const quarter = parseQuarterKey(
    `${levyReturn.periodStart.getUTCFullYear()}-Q${Math.floor(levyReturn.periodStart.getUTCMonth() / 3) + 1}`,
  )
  const deadline = scotlandDeadline(quarter)

  // All confirmed bookings with calculations for this council + period
  const bookings = await db.booking.findMany({
    where: {
      property: { workspaceId: member.workspaceId, council: levyReturn.council },
      checkIn: { gte: levyReturn.periodStart, lte: levyReturn.periodEnd },
      status: 'CONFIRMED',
    },
    include: {
      calculation: true,
      property: true,
    },
    orderBy: { checkIn: 'asc' },
  })

  const isLocked = levyReturn.lockedAt !== null
  const isNilReturn = bookings.filter((b) => b.calculation).length === 0

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/returns" className="text-sm text-stone-500 hover:text-stone-700">
          ← Returns
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold capitalize">
              {levyReturn.council.replace(/_/g, ' ')} — {quarter.label}
            </h1>
            <p className="mt-1 text-sm text-stone-500">{formatQuarterPeriod(quarter)}</p>
          </div>
          <div className="flex items-center gap-2">
            {isLocked && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Locked
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              levyReturn.status === 'FILED' || levyReturn.status === 'PAID'
                ? 'bg-green-100 text-green-700'
                : levyReturn.status === 'READY'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-700'
            }`}>
              {levyReturn.status}
            </span>
          </div>
        </div>
      </div>

      {isNilReturn && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-medium text-amber-900">This is a nil return.</p>
          <p className="mt-1 text-sm text-amber-700">
            You have no confirmed bookings for this council in {quarter.label}. You are still
            required to file a nil return with the council by{' '}
            {deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Levy due" value={formatPence(levyReturn.totalLevyPence)} />
        <SummaryCard label="VAT on levy" value={formatPence(levyReturn.totalVatOnLevyPence)} />
        <SummaryCard label="Retention (host keeps)" value={formatPence(levyReturn.totalRetentionPence)} />
        <SummaryCard
          label="Net payable to council"
          value={formatPence(levyReturn.netPayablePence)}
          highlight
        />
      </div>

      <p className="mb-2 text-xs text-stone-400">
        Filing deadline:{' '}
        {deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
      </p>

      {/* Actions — client component for lock/unlock/download/nil reminder */}
      <ReturnActions
        returnId={returnId}
        isLocked={isLocked}
        isNilReturn={isNilReturn}
        status={levyReturn.status}
      />

      {/* Per-booking appendix */}
      {bookings.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold">Bookings included in this return</h2>
          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Property</th>
                  <th className="px-3 py-2 font-medium">Check-in</th>
                  <th className="px-3 py-2 font-medium">Check-out</th>
                  <th className="px-3 py-2 font-medium">Ref</th>
                  <th className="px-3 py-2 font-medium text-right">Nights</th>
                  <th className="px-3 py-2 font-medium text-right">Base</th>
                  <th className="px-3 py-2 font-medium text-right">Levy</th>
                  <th className="px-3 py-2 font-medium text-right">Retention</th>
                  <th className="px-3 py-2 font-medium">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50">
                    <td className="px-3 py-2 text-xs">{b.property.name}</td>
                    <td className="px-3 py-2 text-xs">{b.checkIn.toLocaleDateString('en-GB')}</td>
                    <td className="px-3 py-2 text-xs">{b.checkOut.toLocaleDateString('en-GB')}</td>
                    <td className="px-3 py-2 font-mono text-xs text-stone-400">{b.externalRef ?? '—'}</td>
                    <td className="px-3 py-2 text-right text-xs">{b.calculation?.nightsCharged ?? '—'}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {b.calculation ? formatPence(b.calculation.basePence) : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs font-medium">
                      {b.calculation ? formatPence(b.calculation.levyPence) : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {b.calculation ? formatPence(b.calculation.retentionPence) : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {(b.calculation?.flags ?? [])
                        .filter((f) => !b.acknowledgedFlags.includes(f))
                        .map((f) => (
                          <span
                            key={f}
                            className="mr-1 inline-block rounded bg-amber-100 px-1 py-0.5 font-mono text-[10px] text-amber-800"
                          >
                            {f}
                          </span>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-stone-200 bg-stone-50 font-medium">
                <tr>
                  <td colSpan={6} className="px-3 py-2 text-xs text-right text-stone-500">Totals</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatPence(levyReturn.totalLevyPence)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatPence(levyReturn.totalRetentionPence)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {isLocked && (
            <p className="mt-2 text-xs text-stone-400">
              This return is locked. The figures above are the snapshot taken at lock time
              ({levyReturn.lockedAt?.toLocaleString('en-GB')}). Edits to bookings after locking
              are logged as amendments and do not affect these totals.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'border-stone-900 bg-stone-900' : 'border-stone-200'}`}>
      <p className={`text-xs ${highlight ? 'text-stone-400' : 'text-stone-500'}`}>{label}</p>
      <p className={`mt-1 text-xl font-semibold font-mono ${highlight ? 'text-white' : 'text-stone-900'}`}>
        {value}
      </p>
    </div>
  )
}
