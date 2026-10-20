import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="border-t border-stone-800 bg-stone-900">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <p>
          <span className="font-semibold text-stone-400">Levy Desk</span> — visitor levy
          return management for Scotland and Wales
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          <Link href="/about" className="hover:text-stone-300 transition-colors">About</Link>
          <Link href="/privacy" className="hover:text-stone-300 transition-colors">Privacy policy</Link>
          <Link href="/terms" className="hover:text-stone-300 transition-colors">Terms of service</Link>
          <Link href="/edinburgh-visitor-levy" className="hover:text-stone-300 transition-colors">Edinburgh levy</Link>
          <Link href="/glasgow-visitor-levy" className="hover:text-stone-300 transition-colors">Glasgow levy</Link>
          <Link href="/cardiff-tourism-levy" className="hover:text-stone-300 transition-colors">Cardiff levy</Link>
        </nav>
      </div>
    </footer>
  )
}
