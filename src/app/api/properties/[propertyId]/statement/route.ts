import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseQuarterKey } from '@/lib/quarters'
import { generateStatementPDF } from '@/lib/pdf/statement-pdf'
import type { StatementRow } from '@/lib/pdf/statement-pdf'

export const runtime = 'nodejs'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ propertyId: string }> },
) {
  const { propertyId } = await params
  const { searchParams } = new URL(req.url)
  const quarterKey = searchParams.get('quarter')

  const session = await auth()
  if (!session?.user?.id) return new NextResponse('Unauthorised', { status: 401 })

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!member) return new NextResponse('Forbidden', { status: 403 })

  const property = await db.property.findFirst({
    where: { id: propertyId, workspaceId: member.workspaceId },
  })
  if (!property) return new NextResponse('Not found', { status: 404 })

  if (!quarterKey) return new NextResponse('Missing quarter param', { status: 400 })

  let quarter
  try {
    quarter = parseQuarterKey(quarterKey)
  } catch {
    return new NextResponse('Invalid quarter', { status: 400 })
  }

  const bookings = await db.booking.findMany({
    where: {
      propertyId: property.id,
      checkIn: { gte: quarter.periodStart, lte: quarter.periodEnd },
      status: 'CONFIRMED',
    },
    include: { calculation: true },
    orderBy: { checkIn: 'asc' },
  })

  const rows: StatementRow[] = bookings
    .filter((b) => b.calculation)
    .map((b) => ({
      externalRef: b.externalRef,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      nights: b.calculation!.nightsCharged,
      adults: b.adults,
      under18s: b.under18s,
      source: b.source,
      guestPaidGrossPence: b.guestPaidGrossPence,
      levyPence: b.calculation!.levyPence,
      retentionPence: b.calculation!.retentionPence,
    }))

  const totalGrossPence = rows.reduce((s, r) => s + r.guestPaidGrossPence, 0)
  const totalLevyPence = rows.reduce((s, r) => s + r.levyPence, 0)
  const totalRetentionPence = rows.reduce((s, r) => s + r.retentionPence, 0)
  const netPayablePence = totalLevyPence - totalRetentionPence

  const addressParts = [property.addressLine1, property.town, property.postcode].filter(Boolean)
  const propertyAddress = addressParts.length > 0 ? addressParts.join(', ') : property.postcode

  const pdfBuffer = await generateStatementPDF({
    workspaceName: member.workspace.name,
    propertyName: property.name,
    propertyAddress,
    council: property.council,
    country: property.country,
    quarter,
    rows,
    totalGrossPence,
    totalLevyPence,
    totalRetentionPence,
    netPayablePence,
  })

  const filename = `owner-statement-${property.name.replace(/\s+/g, '-').toLowerCase()}-${quarterKey}.pdf`

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
