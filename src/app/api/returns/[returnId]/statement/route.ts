import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

function pence(n: number): string {
  return `£${(n / 100).toFixed(2)}`
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ returnId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { returnId } = await params

  const levyReturn = await db.levyReturn.findUnique({
    where: { id: returnId },
    include: {
      workspace: { include: { members: true } },
      client: true,
    },
  })

  if (!levyReturn) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isMember = levyReturn.workspace.members.some((m) => m.userId === session.user.id)
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Fetch bookings for this council+period, scoped to client if present
  const properties = await db.property.findMany({
    where: {
      workspaceId: levyReturn.workspaceId,
      council: levyReturn.council,
      ...(levyReturn.clientId ? { clientId: levyReturn.clientId } : {}),
    },
    select: { id: true, name: true },
  })

  const propertyIds = properties.map((p) => p.id)
  const propertyNameById: Record<string, string> = Object.fromEntries(
    properties.map((p) => [p.id, p.name]),
  )

  const bookings = await db.booking.findMany({
    where: {
      propertyId: { in: propertyIds },
      checkIn: {
        gte: levyReturn.periodStart,
        lte: levyReturn.periodEnd,
      },
      status: 'CONFIRMED',
    },
    include: { calculation: true },
    orderBy: [{ propertyId: 'asc' }, { checkIn: 'asc' }],
  })

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  const period = `${fmt(levyReturn.periodStart)} to ${fmt(levyReturn.periodEnd)}`
  const subjectName = levyReturn.client?.name ?? levyReturn.workspace.name

  const lines: string[] = [
    `Owner Statement — ${subjectName}`,
    `Council: ${levyReturn.council}`,
    `Period: ${period}`,
    '',
    'Property,Check-in,Check-out,Nights,Gross income,Levy charged,Net to owner',
  ]

  let totalGross = 0
  let totalLevy = 0

  for (const b of bookings) {
    const calc = b.calculation
    if (!calc) continue
    const nights =
      (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24)
    const levy = calc.levyPence + calc.vatOnLevyPence
    const net = b.guestPaidGrossPence - levy
    totalGross += b.guestPaidGrossPence
    totalLevy += levy

    const property = propertyNameById[b.propertyId] ?? b.propertyId
    const checkIn = new Date(b.checkIn).toISOString().slice(0, 10)
    const checkOut = new Date(b.checkOut).toISOString().slice(0, 10)
    lines.push(
      [
        `"${property}"`,
        checkIn,
        checkOut,
        nights,
        pence(b.guestPaidGrossPence),
        pence(levy),
        pence(net),
      ].join(','),
    )
  }

  lines.push('')
  lines.push(`Totals,,,,${pence(totalGross)},${pence(totalLevy)},${pence(totalGross - totalLevy)}`)
  lines.push('')
  lines.push(`Levy disbursement note: £${(totalLevy / 100).toFixed(2)} is payable to the council as visitor levy.`)

  const csv = lines.join('\n')
  const filename = `owner-statement-${levyReturn.council}-${period.replace(/\s/g, '-')}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
