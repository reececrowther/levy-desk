import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { formatPence } from '@/lib/format'
import { recalculateAll, type ReturnImpact } from '@/server/maintenance/recalculate-all'
import { applyRecalculation } from './actions'

export const metadata = { title: 'Admin · Data maintenance' }
export const dynamic = 'force-dynamic'

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ applied?: string; error?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.email !== process.env.ADMIN_EMAIL) redirect('/dashboard')

  const params = await searchParams
  const report = await recalculateAll({ apply: false, adminUserId: session.user.id })
  const draftChanges = report.draftReturns.filter(
    (r) => r.storedNetPayablePence !== r.correctedNetPayablePence || r.storedLevyPence !== r.correctedLevyPence,
  )
  const nothingToDo =
    report.calculationsChanged === 0 &&
    report.cleaningFeeCorrections === 0 &&
    report.mappingsCorrected === 0 &&
    draftChanges.length === 0

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <div>
        <Link href="/admin" className="text-xs text-stone-500 hover:underline">← Admin</Link>
        <h1 className="mt-1 text-lg font-semibold">Data maintenance</h1>
        <p className="text-sm text-stone-500">
          Recalculate every booking with the current rules. This preview reads only; nothing changes until you apply.
        </p>
      </div>

      {params.applied && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Applied. The preview below has been re-run against the updated data; unlocked figures should now show no
          further changes.
        </div>
      )}
      {params.error === 'confirm' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tick the confirmation box before applying.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Bookings scanned" value={report.bookingsScanned} />
        <Stat label="In locked periods (untouched)" value={report.bookingsInLockedPeriods} />
        <Stat label="Calculations that change" value={report.calculationsChanged} />
        <Stat label="Cleaning fees put back in base" value={report.cleaningFeeCorrections} />
        <Stat label="Saved column mappings corrected" value={report.mappingsCorrected} />
        <Stat label="Net levy change (unlocked)" value={formatPence(report.levyChangePence)} />
      </div>

      <ReturnTable
        title="Draft returns that will be updated"
        empty="No draft returns change."
        rows={draftChanges}
      />

      <ReturnTable
        title="Locked or filed returns that were wrong (not changed: hosts may need telling)"
        empty="No locked returns are affected."
        rows={report.lockedReturns}
        showOwner
      />

      <form action={applyRecalculation} className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
        <label className="flex items-start gap-2 text-sm text-stone-700">
          <input type="checkbox" name="confirm" value="yes" className="mt-0.5" disabled={nothingToDo} />
          I have reviewed the preview. Apply these changes to unlocked bookings, saved mappings and draft returns.
        </label>
        <button
          type="submit"
          disabled={nothingToDo}
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {nothingToDo ? 'Nothing to apply' : 'Apply changes'}
        </button>
      </form>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-stone-900">{value}</p>
    </div>
  )
}

function ReturnTable({
  title,
  empty,
  rows,
  showOwner = false,
}: {
  title: string
  empty: string
  rows: ReturnImpact[]
  showOwner?: boolean
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-stone-500">{empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs text-stone-500">
              <tr>
                <th className="px-3 py-2 font-medium">Workspace</th>
                {showOwner && <th className="px-3 py-2 font-medium">Owner</th>}
                <th className="px-3 py-2 font-medium">Council</th>
                <th className="px-3 py-2 font-medium">Period</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Levy: stored → correct</th>
                <th className="px-3 py-2 font-medium text-right">Net payable: stored → correct</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-stone-100">
                  <td className="px-3 py-2">{r.workspaceName}</td>
                  {showOwner && <td className="px-3 py-2">{r.ownerEmail ?? '—'}</td>}
                  <td className="px-3 py-2 capitalize">{r.council.replace('_', ' ')}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.periodStart} – {r.periodEnd}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2 text-right font-mono whitespace-nowrap">
                    {formatPence(r.storedLevyPence)} → {formatPence(r.correctedLevyPence)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono whitespace-nowrap">
                    {formatPence(r.storedNetPayablePence)} → {formatPence(r.correctedNetPayablePence)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
