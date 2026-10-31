import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NewImportForm } from './form'

export const metadata = { title: 'Import bookings' }

export default async function NewImportPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) redirect('/account')

  const properties = await db.property.findMany({
    where: { workspaceId: member.workspaceId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-6">
        <Link href="/imports" className="text-sm text-stone-500 hover:text-stone-700">
          ← Imports
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Upload bookings file</h1>
        <p className="mt-1 text-sm text-stone-500">
          Accepts CSV or Excel (.xlsx) exports from Airbnb, Booking.com, and other platforms.
        </p>
      </div>
      <NewImportForm properties={properties} />
    </div>
  )
}
