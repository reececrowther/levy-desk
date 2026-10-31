import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { EditPropertyForm } from './form'

export const metadata = { title: 'Edit property' }

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) redirect('/account')

  const property = await db.property.findFirst({
    where: { id: propertyId, workspaceId: member.workspaceId },
  })
  if (!property) notFound()

  return (
    <div className="p-8 max-w-lg space-y-6">
      <div>
        <Link href="/properties" className="text-sm text-stone-500 hover:text-stone-700">
          ← Properties
        </Link>
        <h1 className="mt-2 text-lg font-semibold">Edit property</h1>
      </div>
      <EditPropertyForm property={property} />
    </div>
  )
}
