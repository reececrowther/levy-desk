import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatPence } from '@/lib/format'
import { parseQuarterKey, scotlandDeadline } from '@/lib/quarters'

export const metadata = { title: 'Returns' }

const STATUS_STYLE: Record<string, string> = {
  DRAFT: 'bg-stone-100 text-stone-700',
  READY: 'bg-amber-100 text-amber-800',
  FILED: 'bg-green-100 text-green-700',
  PAID: 'bg-blue-100 text-blue-800',
}

export default async function ReturnsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!member) redirect('/account')

  const returns = await db.levyReturn.findMany({
    where: { workspaceId: member.workspaceId },
    orderBy: [{ periodStart: 'desc' }, { council: 'asc' }],
  })

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Returns</h1>
        <Link
          href="/returns/new"
          className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700"
        >
          New return
        </Link>
      </div>

      {returns.length === 0 ? (
        <p className="text-sm text-stone-500">
          No returns yet.{' '}
          <Link href="/returns/new" className="underline">
            Generate one.
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
              <tr>
                <th className="px-4 py-2 font-medium">Council</th>
                <th className="px-4 py-2 font-medium">Period</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Levy due</th>
                <th className="px-4 py-2 font-medium text-right">Net payable</th>
                <th className="px-4 py-2 font-medium">Deadline</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {returns.map((r) => {
                const quarter = parseQuarterKey(
                  `${r.periodStart.getUTCFullYear()}-Q${Math.floor(r.periodStart.getUTCMonth() / 3) + 1}`,
                )
                const deadline = scotlandDeadline(quarter)
                return (
                  <tr key={r.id} className="hover:bg-stone-50">
                    <td className="px-4 py-2 capitalize">{r.council.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2">{quarter.label}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_STYLE[r.status] ?? ''}`}>
                        {r.status}
                        {r.lockedAt ? ' 🔒' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono">{formatPence(r.totalLevyPence)}</td>
                    <td className="px-4 py-2 text-right font-mono font-medium">{formatPence(r.netPayablePence)}</td>
                    <td className="px-4 py-2 text-stone-500">
                      {deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link href={`/returns/${r.id}`} className="text-xs text-blue-600 hover:underline">
                        View
                      </Link>
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
