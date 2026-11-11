import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { LevyCalculator } from '@/components/marketing/levy-calculator'
import { DeadlineBanner } from '@/components/marketing/deadline-banner'

export const revalidate = 3600

const PATH = '/edinburgh-visitor-levy/cleaning-fees'
const GUIDANCE_URL =
  'https://www.edinburgh.gov.uk/downloads/file/40692/edinburgh-visitor-levy-scheme-information-for-accommodation-providers'

export const metadata: Metadata = {
  title: { absolute: 'Is the Cleaning Fee Included in the Edinburgh Visitor Levy? | Levy Desk' },
  description:
    "Yes. Edinburgh council's guidance says a standard cleaning fee is part of the accommodation price even when it's shown separately, and on long stays it's charged in full. Worked examples and the one exception.",
  keywords: [
    'visitor levy cleaning fee',
    'edinburgh visitor levy cleaning fee',
    'is cleaning fee included in visitor levy',
    'airbnb cleaning fee visitor levy',
    'visitor levy levy base',
    'edinburgh tourist tax cleaning fee',
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Is the Cleaning Fee Included in the Edinburgh Visitor Levy?',
    description:
      "Yes. A standard cleaning fee counts towards the levy even when it's itemised, and it's charged in full on stays over 5 nights.",
    type: 'article',
    locale: 'en_GB',
    siteName: 'Levy Desk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is the Cleaning Fee Included in the Edinburgh Visitor Levy?',
    description: "Yes, even when it's itemised. And it's charged in full on stays over 5 nights.",
  },
}

const FAQ = [
  {
    q: 'Airbnb shows the cleaning fee as a separate line. Is it still included?',
    a: "Yes. The council's guidance says standard cleaning is part of the accommodation even when it is itemised separately, because guests cannot book without it.",
  },
  {
    q: 'When is a cleaning charge excluded?',
    a: 'Only when it is genuinely optional, meaning guests can choose not to have it and still book, for example an extra mid-stay clean. Optional extras such as parking, meals and laundry services are also excluded when charged separately.',
  },
  {
    q: 'How does the cleaning fee work with the 5-night cap?',
    a: "The cap limits the levy to the first 5 nights of a stay, but a one-off fee such as cleaning is charged in full, not split across the nights. On a 7-night stay, the levy is on 5 nights' accommodation plus the whole cleaning fee.",
  },
  {
    q: 'I already filed my first return without the cleaning fee. What should I do?',
    a: 'Contact the council visitor levy team and ask how they want the correction made. Correct your figures for future returns, and keep a note of the difference and when you raised it.',
  },
  {
    q: 'Does the same apply in Glasgow?',
    a: "Glasgow's user guide excludes optional services such as laundry but does not single out cleaning fees. Levy Desk treats a standard cleaning fee the same way as in Edinburgh. If you are unsure, check with Glasgow City Council.",
  },
]

function BreadcrumbSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Levy Desk', item: 'https://www.levydesk.co.uk' },
      { '@type': 'ListItem', position: 2, name: 'Edinburgh Visitor Levy', item: 'https://www.levydesk.co.uk/edinburgh-visitor-levy' },
      { '@type': 'ListItem', position: 3, name: 'Cleaning fees', item: `https://www.levydesk.co.uk${PATH}` },
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

function FaqSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold' : ''}`}>
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export default function CleaningFeesPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf8f2' }}>
      <BreadcrumbSchema />
      <FaqSchema />
      <MarketingNav />
      <DeadlineBanner />

      <main className="mx-auto max-w-3xl px-6 py-12 space-y-12">
        <nav className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-700">Levy Desk</Link>
          <span className="mx-2">/</span>
          <Link href="/edinburgh-visitor-levy" className="hover:text-stone-700">Edinburgh Visitor Levy</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">Cleaning fees</span>
        </nav>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">Edinburgh</span>
            <span className="text-xs text-stone-400">
              Last reviewed: November 2026 &middot;{' '}
              <a href={GUIDANCE_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-600">
                Council guidance v2.1 (Sept 2026)
              </a>
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Is the cleaning fee included in the Edinburgh visitor levy?
          </h1>
          <p className="text-xl text-stone-600 leading-relaxed">
            Yes. A standard cleaning fee counts towards the levy, even when Airbnb or Booking.com shows it as a separate
            line. It&apos;s one of the most common mistakes in the first returns.
          </p>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-6 py-5 space-y-1">
          <p className="font-semibold text-orange-900">What the guidance says</p>
          <p className="text-sm text-orange-800">
            Standard cleaning is part of the accommodation because guests can&apos;t book without it, so it&apos;s
            included in the levy base even when itemised separately. It&apos;s excluded only if guests can genuinely
            opt out of it (guidance page 4).
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Example 1: a 3-night stay</h2>
          <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-700 space-y-1">
            <Row label="3 nights at £120" value="£360.00" />
            <Row label="Cleaning fee" value="£60.00" />
            <Row label="Levy base" value="£420.00" />
            <Row label="Levy at 5%" value="£21.00" bold />
            <p className="pt-2 text-xs text-stone-500">Leaving out the cleaning fee would give £18.00: £3 short on one booking.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Example 2: a 7-night stay and the 5-night cap</h2>
          <p className="text-stone-600 leading-relaxed">
            Edinburgh charges the levy on the first 5 nights of a stay only. A one-off fee like cleaning isn&apos;t split
            across the nights: it&apos;s charged in full (guidance page 8).
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-700 space-y-1">
            <Row label="Guest pays: 7 nights at £120 plus £60 cleaning" value="£900.00" />
            <Row label="First 5 nights at £120" value="£600.00" />
            <Row label="Cleaning fee, in full" value="£60.00" />
            <Row label="Levy base" value="£660.00" />
            <Row label="Levy at 5%" value="£33.00" bold />
            <p className="pt-2 text-xs text-stone-500">
              Splitting the cleaning fee across 7 nights and counting only 5 of them would give £32.14.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">What is and isn&apos;t included</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <p className="font-semibold text-stone-800">Included</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-stone-600 space-y-1">
                <li>Nightly accommodation price</li>
                <li>Standard cleaning fee, even if itemised</li>
                <li>Commission charged to the guest</li>
              </ul>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <p className="font-semibold text-stone-800">Excluded</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-stone-600 space-y-1">
                <li>Genuinely optional cleaning</li>
                <li>Separately charged parking, meals and drinks, laundry, transport</li>
                <li>VAT on the accommodation, if you&apos;re VAT-registered</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4" id="calculator">
          <h2 className="text-lg font-semibold text-stone-900">Check a booking</h2>
          <p className="text-sm text-stone-500">
            Enter the total the guest paid, including the cleaning fee. For stays of 5 nights or fewer the result is
            exact. For longer stays this quick calculator spreads the cleaning fee across the nights, so it can be a
            little low (as in example 2). Levy Desk&apos;s booking import charges the cleaning fee in full.
          </p>
          <LevyCalculator defaultCouncil="edinburgh" defaultCheckIn="2026-11-06" defaultCheckOut="2026-11-09" />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-stone-200 bg-white">
                <summary className="flex cursor-pointer select-none items-center justify-between px-5 py-4 text-sm font-medium text-stone-800 hover:bg-stone-50">
                  {q}
                  <span className="ml-4 shrink-0 text-stone-400 group-open:rotate-180 transition-transform">&#8964;</span>
                </summary>
                <div className="border-t border-stone-100 px-5 py-4 text-sm text-stone-600 leading-relaxed">{a}</div>
              </details>
            ))}
          </div>
        </section>

        <p className="text-sm text-stone-600">
          Related:{' '}
          <Link href="/edinburgh-visitor-levy/does-booking-com-pay-the-levy" className="text-orange-700 underline">Does Booking.com pay the levy for you?</Link>
          {' · '}
          <Link href="/edinburgh-visitor-levy/airbnb-hosts" className="text-orange-700 underline">Edinburgh levy for Airbnb hosts</Link>
          {' · '}
          <Link href="/edinburgh-visitor-levy/how-to-file" className="text-orange-700 underline">How to file the return</Link>
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> This page summarises City of Edinburgh Council&apos;s published guidance for
          accommodation providers. Always check{' '}
          <a href={GUIDANCE_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">the official guidance</a>{' '}
          before filing. Levy Desk does not provide legal or tax advice.
        </div>

        <section className="rounded-2xl bg-stone-900 px-8 py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Cleaning fees handled automatically</h2>
          <p className="text-stone-400 max-w-lg mx-auto text-sm">
            Import your Airbnb and Booking.com exports. Levy Desk includes standard cleaning fees, applies the 5-night
            cap correctly and shows the working for every booking.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/account" className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors">
              Start for free
            </Link>
            <Link href="/letting-agents" className="rounded-lg border border-stone-700 px-6 py-3 text-sm font-medium text-stone-300 hover:bg-stone-800 transition-colors">
              For letting agents
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
