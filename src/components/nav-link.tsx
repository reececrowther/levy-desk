'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  // /dashboard is exact-match only; all other links match on prefix
  const isActive =
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 hover:bg-orange-50 hover:text-stone-900 ${
        isActive
          ? 'bg-orange-50 font-medium text-stone-900'
          : 'text-stone-600'
      }`}
    >
      {children}
    </Link>
  )
}
