import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateReturnCSV } from '@/lib/csv/return-csv'
import { parseQuarterKey } from '@/lib/quarters'
import type { ReturnRow } from '@/lib/csv/return-csv'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ returnId: string }> },
) {
  const { returnId } = await params

  const session = await auth()
  if (!session?.user?.id) return new NextResponse('Unauthorised', { status: 401 })

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!member) return new NextResponse('Forbidden', { status: 403 })

  const levyReturn = await db.levyReturn.findFirst({
    where: { id: returnId, workspaceId: member.workspaceId },
  })
  if (!levyReturn) return new NextResponse('Not found', { status: 404 })

  const bookings = await db.booking.findMany({
    where: {
      property: { workspaceId: member.workspaceId, council: levyReturn.council },
      checkIn: { gte: levyReturn.periodStart, lte: levyReturn.periodEnd },
      status: 'CONFIRMED',
    },
    include: { calculation: true, property: true },
    orderBy: { checkIn: 'asc' },
  })

  const quarter = parseQuarterKey(
    `${levyReturn.periodStart.getUTCFullYear()}-Q${Math.floor(levyReturn.periodStart.getUTCMonth() / 3) + 1}`,
  )

  const rows: ReturnRow[] = bookings
    .filter((b) => b.calculation)
    .map((b) => ({
      externalRef: b.externalRef,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      nights: b.calculation!.nightsCharged,
      adults: b.adults,
      under18s: b.under18s,
      source: b.source,
      basePence: b.calculation!.basePence,
      exclusionsPence: b.calculation!.exclusionsPence,
      levyPence: b.calculation!.levyPence,
      vatOnLevyPence: b.calculation!.vatOnLevyPence,
      retentionPence: b.calculation!.retentionPence,
      schemeRuleId: b.calculation!.schemeRuleId,
      flags: b.calculation!.flags,
    }))

  const csv = generateReturnCSV({
    workspaceName: member.workspace.name,
    council: levyReturn.council,
    quarter,
    totalNightsCharged: rows.reduce((s, r) => s + r.nights, 0),
    totalBasePence: rows.reduce((s, r) => s + r.basePence, 0),
    totalExclusionsPence: rows.reduce((s, r) => s + r.exclusionsPence, 0),
    totalLevyPence: levyReturn.totalLevyPence,
    totalVatOnLevyPence: levyReturn.totalVatOnLevyPence,
    totalRetentionPence: levyReturn.totalRetentionPence,
    netPayablePence: levyReturn.netPayablePence,
    rows,
  })

  const filename = `levy-return-${levyReturn.council}-${quarter.key}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
