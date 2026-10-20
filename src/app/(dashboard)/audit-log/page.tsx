import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const metadata = { title: 'Audit log' }

export default async function AuditLogPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!member) redirect('/account')

  const logs = await db.auditLog.findMany({
    where: { workspaceId: member.workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const ACTION_STYLE: Record<string, string> = {
    AMENDMENT: 'bg-amber-100 text-amber-800',
    LOCK_RETURN: 'bg-blue-100 text-blue-800',
    UNLOCK_RETURN: 'bg-orange-100 text-orange-800',
    GENERATE_RETURN: 'bg-green-100 text-green-700',
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold">Audit log</h1>

      {logs.length === 0 ? (
        <p className="text-sm text-stone-500">No audit entries yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Action</th>
                <th className="px-4 py-2 font-medium">Entity</th>
                <th className="px-4 py-2 font-medium">Before</th>
                <th className="px-4 py-2 font-medium">After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.map((log) => (
                <tr key={log.id} className="align-top hover:bg-stone-50">
                  <td className="whitespace-nowrap px-4 py-2 text-xs text-stone-500">
                    {log.createdAt.toLocaleString('en-GB')}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${ACTION_STYLE[log.action] ?? 'bg-stone-100 text-stone-700'}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <span className="text-stone-500">{log.entityType}</span>
                    <br />
                    <span className="font-mono text-[10px] text-stone-400">{log.entityId.slice(0, 12)}…</span>
                  </td>
                  <td className="max-w-[200px] px-4 py-2">
                    {log.before && (
                      <pre className="overflow-x-auto text-[10px] text-stone-500 whitespace-pre-wrap">
                        {JSON.stringify(log.before, null, 1)}
                      </pre>
                    )}
                  </td>
                  <td className="max-w-[200px] px-4 py-2">
                    {log.after && (
                      <pre className="overflow-x-auto text-[10px] text-stone-700 whitespace-pre-wrap">
                        {JSON.stringify(log.after, null, 1)}
                      </pre>
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
