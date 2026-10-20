import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { signOut } from '@/lib/auth'
import { db } from '@/lib/db'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })

  const isAccountant = member?.role === 'ACCOUNTANT'
  const isAgent = member?.workspace.plan === 'AGENT'
  const isAdmin = session.user.email === process.env.ADMIN_EMAIL

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-stone-200 bg-white">
        <div className="flex h-14 items-center gap-2 border-b border-stone-200 px-4">
          <span className="text-sm font-bold tracking-tight text-stone-900">Levy Desk</span>
          {member && (
            <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
              {member.workspace.plan}
            </span>
          )}
        </div>
        <nav className="flex flex-col gap-0.5 p-2 text-sm">
          {!isAccountant && (
            <>
              <NavLink href="/dashboard">Dashboard</NavLink>
              {isAgent && <NavLink href="/clients">Clients</NavLink>}
              <NavLink href="/properties">Properties</NavLink>
              <NavLink href="/bookings">Bookings</NavLink>
              <NavLink href="/imports">Imports</NavLink>
              <NavLink href="/exceptions">Exceptions</NavLink>
            </>
          )}
          <NavLink href="/returns">Returns</NavLink>
          <NavLink href="/audit-log">Audit log</NavLink>
          {isAccountant && (
            <p className="mt-2 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-stone-400">
              Read-only access
            </p>
          )}
          {!isAccountant && <NavLink href="/account">Account</NavLink>}
          {isAdmin && (
            <NavLink href="/admin">Admin</NavLink>
          )}
        </nav>
        <div className="absolute bottom-0 w-56 border-t border-stone-200 bg-white p-3">
          <p className="truncate text-xs text-stone-500">{session.user.email}</p>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button type="submit" className="mt-1 text-xs text-stone-400 hover:text-stone-600">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 overflow-auto">
        {!member && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
            You don't have a workspace yet.{' '}
            <Link href="/account" className="font-medium underline">
              Create one to get started.
            </Link>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-stone-600 hover:bg-orange-50 hover:text-stone-900"
    >
      {children}
    </Link>
  )
}
