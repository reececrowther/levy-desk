import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { RowResult } from '@/lib/importers/processor'

export default async function ResultsPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!member) redirect('/login')

  const batch = await db.importBatch.findFirst({
    where: { id: batchId, workspaceId: member.workspace.id },
    include: { property: true },
  })
  if (!batch) notFound()

  if (batch.status === 'PENDING') redirect(`/imports/${batchId}/map`)
  if (batch.status === 'PROCESSING') {
    return (
      <div className="p-6">
        <p className="text-sm text-stone-500">Import is still processing…</p>
      </div>
    )
  }

  const results = (batch.results ?? []) as RowResult[]

  const statusIcon: Record<string, string> = {
    imported: '✓',
    skipped: '–',
    error: '✕',
  }
  const statusColour: Record<string, string> = {
    imported: 'text-green-700',
    skipped: 'text-stone-400',
    error: 'text-red-600',
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/imports" className="text-sm text-stone-500 hover:text-stone-700">
          ← Imports
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Import results</h1>
        <p className="mt-1 text-sm text-stone-500">
          <span className="font-medium">{batch.filename}</span> for {batch.property.name}
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4 sm:grid-cols-4">
        <StatCard label="Total rows" value={batch.totalRows} />
        <StatCard label="Imported" value={batch.importedRows} colour="text-green-700" />
        <StatCard label="Skipped (duplicate)" value={batch.skippedRows} colour="text-stone-500" />
        <StatCard label="Errors" value={batch.errorRows} colour={batch.errorRows > 0 ? 'text-red-600' : undefined} />
      </div>

      {batch.errorRows > 0 && (
        <p className="mb-4 text-sm text-stone-600">
          Rows with errors are shown below. Fix the source data and re-upload, or add the bookings
          manually.
        </p>
      )}

      {/* Row-level results */}
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
            <tr>
              <th className="px-4 py-2 font-medium">Row</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Check-in</th>
              <th className="px-4 py-2 font-medium">Ref</th>
              <th className="px-4 py-2 font-medium">Booking</th>
              <th className="px-4 py-2 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {results.map((r) => (
              <tr key={r.rowIndex} className="hover:bg-stone-50">
                <td className="px-4 py-2 text-xs text-stone-400">{r.rowIndex}</td>
                <td className={`px-4 py-2 font-mono text-xs font-medium ${statusColour[r.status] ?? ''}`}>
                  {statusIcon[r.status]} {r.status}
                </td>
                <td className="px-4 py-2 text-xs">{r.checkIn ?? ''}</td>
                <td className="px-4 py-2 font-mono text-xs text-stone-500">{r.externalRef ?? ''}</td>
                <td className="px-4 py-2 text-xs">
                  {r.bookingId && (
                    <Link
                      href={`/bookings/${r.bookingId}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  )}
                </td>
                <td className="px-4 py-2 text-xs text-stone-500">{r.error ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/bookings?propertyId=${batch.propertyId}`}
          className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700"
        >
          View bookings
        </Link>
        <Link
          href="/imports/new"
          className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
        >
          New import
        </Link>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  colour,
}: {
  label: string
  value: number
  colour?: string
}) {
  return (
    <div className="rounded-lg border border-stone-200 p-4">
      <p className="text-xs text-stone-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${colour ?? 'text-stone-900'}`}>{value}</p>
    </div>
  )
}
