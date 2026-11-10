import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export const metadata: Metadata = {
  title: { absolute: 'Visitor Levy Returns for Letting Agents & Short-Let Managers | Levy Desk' },
  description:
    'Work out Edinburgh and Glasgow visitor levy figures for every owner you manage, from Airbnb and Booking.com exports. Per-property owner statements, full working, flagged exceptions. Free setup before 30 January.',
  keywords: [
    'visitor levy software letting agents',
    'visitor levy short let management',
    'Edinburgh visitor levy letting agent',
    'Glasgow visitor levy letting agent',
    'visitor levy owner statements',
    'visitor levy multiple properties',
  ],
  alternates: { canonical: '/letting-agents' },
  openGraph: {
    title: 'Visitor Levy Returns for Letting Agents & Short-Let Managers',
    description:
      "Every owner's levy figures from Airbnb and Booking.com exports, checked against council guidance. Edinburgh now, Glasgow from 25 January 2027.",
    type: 'website',
    locale: 'en_GB',
    siteName: 'Levy Desk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visitor Levy Returns for Letting Agents',
    description: "Every owner's levy figures from Airbnb and Booking.com exports. Edinburgh now, Glasgow from 25 January 2027.",
  },
}

const PROBLEMS = [
  {
    title: 'Many owners, many platforms',
    desc: 'Airbnb, Booking.com and direct bookings for dozens of properties, each owner needing their own figures.',
  },
  {
    title: 'Rules that are easy to get wrong',
    desc: 'Cleaning fees count towards the levy. The platforms do not pay it to the council for you. A New Year stay belongs in the quarter the guest checks out.',
  },
  {
    title: 'Two cities, two schemes',
    desc: "From 25 January 2027 Glasgow has its own levy: no night cap, 1.5% retention and a different booking cut-off from Edinburgh's.",
  },
]

const FEATURES = [
  {
    title: 'Import exports, no retyping',
    desc: 'Upload Airbnb and Booking.com CSV or Excel exports. Columns are matched automatically and duplicates are skipped.',
  },
  {
    title: 'Owners kept separate',
    desc: 'Group properties under each owner (client), so every property has its own figures.',
  },
  {
    title: 'The working for every booking',
    desc: 'Nights charged, levy base, one-off fees, VAT and retention, step by step. Something you can show an owner or the council.',
  },
  {
    title: 'Exceptions flagged, not guessed',
    desc: 'Bookings that need a decision, such as a stay booked before October 2025 with no payment date, are queued for you to check.',
  },
  {
    title: 'Quarterly return figures',
    desc: 'Per council and quarter: levy due, retention, VAT on the levy and net payable, with CSV and PDF downloads for your records.',
  },
  {
    title: 'Owner statements',
    desc: 'A statement for each property and quarter, as a PDF, ready to send to its owner.',
  },
]

const FAQ = [
  {
    q: 'Do you file the return or pay the council for us?',
    a: 'No. Levy Desk works out the figures and keeps the records. You or your client file on visitorlevy.scot and pay the council, so the legal responsibility stays where the law puts it.',
  },
  {
    q: 'Which councils are covered?',
    a: "Edinburgh, checked against the council's September 2026 guidance, and Glasgow, checked against Glasgow City Council's user guide, ready for its 25 January 2027 start. Other councils are added as their schemes are confirmed and checked.",
  },
  {
    q: 'Can you set it up for us?',
    a: 'Yes, free before the 30 January 2027 return. Send one owner\'s Airbnb or Booking.com export and I will set up your owners and import October to December myself.',
  },
  {
    q: 'What does it cost?',
    a: 'The Agent plan is £25 a month including 5 units, then £5 per unit per month.',
  },
  {
    q: 'Can our accountant see the figures?',
    a: 'Yes. You can invite your accountant with read-only access to your workspace.',
  },
]

function FaqSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

export default function LettingAgentsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf8f2' }}>
      <FaqSchema />
      <MarketingNav />

      <main className="mx-auto max-w-4xl px-6 py-16 space-y-16">
        {/* Hero */}
        <div className="space-y-5">
          <div className="w-12 h-1 bg-orange-500 rounded" />
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">For letting agents and short-let managers</p>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">
            Every owner&apos;s visitor levy figures, from your Airbnb and Booking.com exports
          </h1>
          <p className="text-xl text-stone-600 leading-relaxed">
            Edinburgh now, Glasgow from 25 January 2027. Every figure is checked against the council&apos;s own guidance,
            with the working shown.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="mailto:reece@levydesk.co.uk?subject=Levy%20Desk%20setup"
              className="inline-flex items-center rounded-lg bg-orange-600 px-5 py-3 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
            >
              Get free setup before 30 January
            </a>
            <Link
              href="/account"
              className="inline-flex items-center rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50 transition-colors"
            >
              Start on your own
            </Link>
          </div>
        </div>

        {/* Video */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-900">See it in 2 minutes</h2>
          <video
            controls
            preload="none"
            poster="/videos/levy-desk-walkthrough-poster.jpg"
            className="w-full rounded-xl border border-stone-200 bg-white shadow-sm"
          >
            <source src="/videos/levy-desk-walkthrough.mp4" type="video/mp4" />
          </video>
          <p className="text-xs text-stone-500">Demo data: all owners, guests and bookings in the video are made up.</p>
        </section>

        {/* Problems */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-stone-900">Why it&apos;s harder for agents</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="rounded-xl border border-stone-200 bg-white p-5">
                <p className="font-semibold text-stone-800">{p.title}</p>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-stone-900">What Levy Desk does</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-stone-200 bg-white p-5">
                <p className="font-semibold text-stone-800">{f.title}</p>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-stone-600">
            Want the detail? Read{' '}
            <Link href="/edinburgh-visitor-levy/how-to-file" className="text-orange-700 underline">
              how to file the Edinburgh return
            </Link>{' '}
            and the{' '}
            <Link href="/glasgow-visitor-levy" className="text-orange-700 underline">
              Glasgow levy rules
            </Link>
            .
          </p>
        </section>

        {/* Pricing */}
        <section className="rounded-xl border border-orange-200 bg-orange-50 p-6 space-y-2">
          <h2 className="text-xl font-semibold text-stone-900">Pricing</h2>
          <p className="text-stone-700">
            <strong>£25 a month</strong> including 5 units, then <strong>£5 per unit</strong> per month.
          </p>
          <p className="text-sm text-stone-600">
            Free setup before the 30 January 2027 return: send one owner&apos;s export and I&apos;ll import October to
            December for you.
          </p>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-900">Questions agents ask</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-xl border border-stone-200 bg-white p-5">
                <p className="font-semibold text-stone-800">{f.q}</p>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
