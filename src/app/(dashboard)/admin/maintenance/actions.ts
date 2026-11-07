'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { recalculateAll } from '@/server/maintenance/recalculate-all'

export async function applyRecalculation(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Not authorised.')
  }
  if (formData.get('confirm') !== 'yes') {
    redirect('/admin/maintenance?error=confirm')
  }
  await recalculateAll({ apply: true, adminUserId: session.user.id })
  revalidatePath('/', 'layout')
  redirect('/admin/maintenance?applied=1')
}
