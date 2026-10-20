import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NewBookingForm } from './form'

export const metadata = { title: 'Add booking' }

export default async function NewBookingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) redirect('/account')

  const properties = await db.property.findMany({
    where: { workspaceId: member.workspaceId },
    orderBy: { name: 'asc' },
  })

  if (properties.length === 0) {
    redirect('/properties/new')
  }

  return (
    <div className="p-8 max-w-lg space-y-6">
      <h1 className="text-lg font-semibold">Add booking</h1>
      <NewBookingForm properties={properties.map((p) => ({ id: p.id, name: p.name }))} />
    </div>
  )
}
