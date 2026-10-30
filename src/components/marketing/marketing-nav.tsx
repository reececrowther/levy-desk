import Link from 'next/link'

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#fdf8f2]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-sm font-bold tracking-tight text-stone-900">
          Levy Desk
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/visitor-levy-tracker" className="hidden text-sm text-stone-600 hover:text-stone-900 sm:block">
            All councils
          </Link>
          <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900">
            Sign in
          </Link>
          <Link
            href="/account"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
          >
            Try free
          </Link>
        </div>
      </div>
    </header>
  )
}
