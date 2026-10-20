import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatPence, quarterBounds } from '@/lib/format'
import { Badge } from '@/components/ui/badge'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  })

  if (!member) {
    return (
      <div className="p-8">
        <h1 className="text-lg font-semibold">Welcome to Levy Desk</h1>
        <p className="mt-2 text-sm text-stone-500">
          Set up your account to start managing visitor levy returns.
        </p>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const { start: qStart, end: qEnd } = quarterBounds(today)

  // Fetch calculations for stays in current quarter, grouped by council
  const calculations = await db.calculation.findMany({
    include: {
      booking: {
        include: { property: true },
      },
    },
    where: {
      booking: {
        property: { workspaceId: member.workspaceId },
        checkIn: { gte: new Date(qStart) },
        checkOut: { lte: new Date(qEnd + 'T23:59:59') },
        status: 'CONFIRMED',
      },
    },
  })

  // Aggregate levy by council
  const byCouncil = new Map<string, number>()
  let flaggedCount = 0

  for (const calc of calculations) {
    const council = calc.booking.property.council
    byCouncil.set(council, (byCouncil.get(council) ?? 0) + calc.levyPence)
    if (calc.flags.length > 0) flaggedCount++
  }

  // Next filing deadline: end of month after quarter end
  const qEndDate = new Date(qEnd)
  const deadlineDate = new Date(qEndDate)
  deadlineDate.setMonth(deadlineDate.getMonth() + 1)
  deadlineDate.setDate(deadlineDate.getDate() + 1)
  const deadline = deadlineDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-stone-500">{member.workspace.name}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Flagged bookings"
          value={String(flaggedCount)}
          note="Require review before filing"
          urgent={flaggedCount > 0}
        />
        <StatCard
          label="Next filing deadline"
          value={deadline}
          note={`Covers ${qStart} to ${qEnd}`}
        />
        <StatCard
          label="Properties"
          value={String(
            await db.property.count({ where: { workspaceId: member.workspaceId } }),
          )}
          note="Registered with Levy Desk"
        />
      </div>

      {/* Levy by council */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">
          Levy owed this quarter ({qStart} — {qEnd})
        </h2>
        {byCouncil.size === 0 ? (
          <p className="text-sm text-stone-500">No confirmed bookings in the current quarter.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                <th className="pb-2 font-medium">Council</th>
                <th className="pb-2 text-right font-medium">Levy</th>
              </tr>
            </thead>
            <tbody>
              {[...byCouncil.entries()].map(([council, pence]) => (
                <tr key={council} className="border-b border-stone-100">
                  <td className="py-2 capitalize">{council.replace(/_/g, ' ')}</td>
                  <td className="py-2 text-right font-mono">{formatPence(pence)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-2 font-medium">Total</td>
                <td className="pt-2 text-right font-mono font-medium">
                  {formatPence([...byCouncil.values()].reduce((a, b) => a + b, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  note,
  urgent,
}: {
  label: string
  value: string
  note: string
  urgent?: boolean
}) {
  return (
    <div className={`rounded-lg border p-4 ${urgent ? 'border-amber-200 bg-amber-50' : 'border-stone-200 bg-white'}`}>
      <p className="text-xs text-stone-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${urgent ? 'text-amber-800' : 'text-stone-900'}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-stone-400">{note}</p>
    </div>
  )
}
