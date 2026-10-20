import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/server/actions/clients'

export const metadata = { title: 'Add client' }

export default async function NewClientPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })

  if (!member) redirect('/account')
  if (member.workspace.plan !== 'AGENT') redirect('/clients')

  return (
    <div className="p-8 max-w-lg space-y-6">
      <h1 className="text-lg font-semibold">Add client</h1>

      <form
        action={async (fd: FormData) => {
          'use server'
          await createClient(member.workspaceId, {
            name: fd.get('name') as string,
            contactEmail: (fd.get('contactEmail') as string) || undefined,
          })
          redirect('/clients')
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Client name</Label>
          <Input id="name" name="name" required placeholder="Acme Holiday Lets Ltd" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactEmail">Contact email (optional)</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="owner@example.com"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit">Add client</Button>
          <Button type="button" variant="outline" asChild>
            <a href="/clients">Cancel</a>
          </Button>
        </div>
      </form>
    </div>
  )
}
