import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { EditBookingForm } from './form'

export const metadata = { title: 'Edit booking' }

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) redirect('/account')

  const booking = await db.booking.findFirst({
    where: { id: bookingId, property: { workspaceId: member.workspaceId } },
    include: { property: true },
  })
  if (!booking) notFound()

  const properties = await db.property.findMany({
    where: { workspaceId: member.workspaceId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="p-8 max-w-lg space-y-6">
      <div>
        <Link href="/bookings" className="text-sm text-stone-500 hover:text-stone-700">
          ← Bookings
        </Link>
        <h1 className="mt-2 text-lg font-semibold">Edit booking</h1>
      </div>
      <EditBookingForm booking={booking} properties={properties} />
    </div>
  )
}
