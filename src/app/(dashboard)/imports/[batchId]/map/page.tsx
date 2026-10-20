import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { MapForm } from './map-form'

export default async function MapPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!member) redirect('/login')

  const batch = await db.importBatch.findFirst({
    where: { id: batchId, workspaceId: member.workspace.id },
    include: { property: true },
  })
  if (!batch) notFound()

  if (batch.status === 'COMPLETE') redirect(`/imports/${batchId}/results`)

  return (
    <MapForm
      batchId={batch.id}
      source={batch.source}
      filename={batch.filename}
      propertyName={batch.property.name}
      headers={batch.headers}
    />
  )
}
