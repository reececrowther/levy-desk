import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export default async function ImportsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })

  if (!member) {
    return (
      <div className="p-6">
        <p className="text-sm text-stone-500">No workspace found.</p>
      </div>
    )
  }

  const batches = await db.importBatch.findMany({
    where: { workspaceId: member.workspace.id },
    include: { property: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const statusColour: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETE: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Imports</h1>
        <Link
          href="/imports/new"
          className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700"
        >
          New import
        </Link>
      </div>

      {batches.length === 0 ? (
        <p className="text-sm text-stone-500">
          No imports yet.{' '}
          <Link href="/imports/new" className="underline">
            Upload a file to get started.
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
              <tr>
                <th className="px-4 py-2 font-medium">File</th>
                <th className="px-4 py-2 font-medium">Property</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Rows</th>
                <th className="px-4 py-2 font-medium">Imported</th>
                <th className="px-4 py-2 font-medium">Errors</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-stone-50">
                  <td className="max-w-[180px] truncate px-4 py-2 font-mono text-xs">{b.filename}</td>
                  <td className="px-4 py-2">{b.property.name}</td>
                  <td className="px-4 py-2 text-stone-500">{b.source}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${statusColour[b.status] ?? ''}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-stone-500">{b.totalRows}</td>
                  <td className="px-4 py-2 text-green-700">{b.importedRows}</td>
                  <td className="px-4 py-2 text-red-600">{b.errorRows || ''}</td>
                  <td className="px-4 py-2 text-stone-500">
                    {b.createdAt.toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {(b.status === 'COMPLETE' || b.status === 'FAILED') && (
                      <Link
                        href={`/imports/${b.id}/results`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    )}
                    {b.status === 'PENDING' && (
                      <Link
                        href={`/imports/${b.id}/map`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Continue
                      </Link>
                    )}
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
