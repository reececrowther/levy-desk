import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { LevyCalculator } from '@/components/marketing/levy-calculator'
import { DeadlineBanner } from '@/components/marketing/deadline-banner'

export const revalidate = 3600

export const metadata: Metadata = {
  title: { absolute: 'Edinburgh Visitor Levy for Airbnb Hosts — What You Must Do | Levy Desk' },
  description:
    'Airbnb does not collect the Edinburgh visitor levy for you. As an Edinburgh Airbnb host you must collect, calculate, and remit the 5% levy yourself every quarter. Here is exactly what to do.',
  keywords: [
    'Edinburgh visitor levy Airbnb',
    'Edinburgh tourist tax Airbnb hosts',
    'Edinburgh Airbnb levy how to pay',
    'Edinburgh visitor levy short-term let',
    'Edinburgh Airbnb quarterly return',
    'Edinburgh 5% levy Airbnb',
  ],
  alternates: { canonical: '/edinburgh-visitor-levy/airbnb-hosts' },
  openGraph: {
    title: 'Edinburgh Visitor Levy for Airbnb Hosts',
    description: 'Airbnb does not collect the levy for you. How to calculate, collect, and file the Edinburgh 5% visitor levy as an Airbnb host.',
    type: 'article',
    locale: 'en_GB',
    siteName: 'Levy Desk',
  },
}

const FAQ = [
  {
    q: 'Does Airbnb collect the Edinburgh visitor levy on my behalf?',
    a: "No. Unlike in some cities, Airbnb does not collect or remit the Edinburgh visitor levy. You are responsible for including the levy in your Airbnb price, collecting it from guests, and remitting it to the City of Edinburgh Council each quarter. Even if you forget to add it to your price, the legal obligation to pay it still falls on you.",
  },
  {
    q: 'How do I add the Edinburgh levy to my Airbnb listing price?',
    a: "There is no automatic way to add the levy as a separate line item in Airbnb. The simplest approach is to build it into your nightly rate. On a £100/night listing, the levy is 5% of the accommodation price, capped at 5 nights per stay. For most self-catering bookings you can add approximately 3–5% to your nightly rate to cover it, then calculate the exact levy at the end of the quarter from your actual booking data.",
  },
  {
    q: 'Does the levy apply to my Airbnb payout or the guest price?',
    a: "The levy is calculated on the gross guest-paid accommodation price — what the guest pays, not what Airbnb pays out to you after taking its commission. If a guest pays £500 for a stay (5 nights or fewer), the levy is £500 × 5% = £25. Your Airbnb payout of £420 (after 16% commission) is irrelevant to the levy calculation.",
  },
  {
    q: 'Does the levy apply to the cleaning fee?',
    a: "It depends on how the cleaning fee is structured. Edinburgh Council's guidance states the levy applies to accommodation charges. Standard cleaning fees that are part of the accommodation package are typically included in the levy base. Check Edinburgh Council's official guidance or treat cleaning fees conservatively as liable until you receive written confirmation otherwise.",
  },
  {
    q: 'What is the Edinburgh pre-commencement exemption for Airbnb bookings?',
    a: "Airbnb bookings that were both confirmed and fully paid before 1 October 2025 are exempt from the levy, regardless of the stay date. If a guest booked in September 2025 and paid in full at that point, no levy is due even if the stay is in 2027. Part-paid bookings made before 1 October 2025 are not exempt — only fully paid bookings qualify.",
  },
  {
    q: 'I have multiple Airbnb listings in Edinburgh. Do I file one return?',
    a: "You file one return per operator, covering all your Edinburgh properties, rather than one per listing. List each property separately within the return to allow the council to cross-reference your short-term letting licences. Levy Desk handles multi-property filing under a single workspace.",
  },
  {
    q: 'What records do I need to keep?',
    a: "Edinburgh requires you to keep records for five years from the date of each return. For Airbnb bookings you should keep: the guest-paid price, check-in and check-out dates, number of nights, whether the booking was pre-commencement exempt, and the levy calculated. Levy Desk stores all of this per booking and generates an audit-ready return pack.",
  },
]

function BreadcrumbSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Levy Desk', item: 'https://www.levydesk.co.uk' },
      { '@type': 'ListItem', position: 2, name: 'Edinburgh Visitor Levy', item: 'https://www.levydesk.co.uk/edinburgh-visitor-levy' },
      { '@type': 'ListItem', position: 3, name: 'Airbnb Hosts', item: 'https://www.levydesk.co.uk/edinburgh-visitor-levy/airbnb-hosts' },
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

export default function EdinburghAirbnbHostsPage() {
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
          <span className="text-stone-800">Airbnb hosts</span>
        </nav>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Live from 24 Jul 2026</span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">Scotland</span>
            <span className="text-xs text-stone-400">
              Last reviewed: October 2026 &middot;{' '}
              <a href="https://www.edinburgh.gov.uk/visitor-levy" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-600">
                City of Edinburgh Council
              </a>
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Edinburgh Visitor Levy<br className="hidden sm:block" /> for Airbnb Hosts
          </h1>
          <p className="text-xl text-stone-600 leading-relaxed">
            Airbnb does not collect the Edinburgh levy for you. You must calculate it from your gross booking income, file a quarterly return, and pay the council directly. Here is what that means in practice.
          </p>
        </div>

        {/* Key fact banner */}
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 space-y-1">
          <p className="font-semibold text-red-800">Airbnb will not pay this for you</p>
          <p className="text-sm text-red-700">
            Unlike some cities, Edinburgh has not enrolled Airbnb as a levy collection agent. The legal obligation sits with you as the host. If you do not collect and remit the levy, you are the one liable for penalties — not Airbnb.
          </p>
        </div>

        {/* What you must do */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">What Edinburgh Airbnb hosts must do</h2>
          <div className="space-y-3">
            {[
              {
                step: '1',
                title: 'Register with Edinburgh City Council',
                desc: 'Register as an accommodation provider at visitorlevy.scot. You will need your short-term letting licence number. Do this once — the same account is used for all future quarterly returns.',
              },
              {
                step: '2',
                title: 'Build the levy into your Airbnb price',
                desc: 'Airbnb has no separate levy line. Add approximately 3–5% to your nightly rate to cover it, or absorb the cost. Either way, the levy is calculated on what the guest pays — not your payout after Airbnb commission.',
              },
              {
                step: '3',
                title: 'Calculate the levy for each booking at quarter-end',
                desc: 'For each Airbnb booking in the quarter: gross guest price × 5%, capped at 5 nights per stay. Export your Airbnb earnings report and run the figures through the calculator below, or import directly into Levy Desk.',
              },
              {
                step: '4',
                title: 'Apply the 2% host retention',
                desc: 'You can keep 2% of the total levy collected in the quarter as an administration contribution before remitting the rest to the council.',
              },
              {
                step: '5',
                title: 'File and pay by the deadline',
                desc: 'Log in to visitorlevy.scot, enter your quarterly figures, and pay the net levy. The Q4 2026 return covers Oct–Dec 2026 and is due 31 January 2027.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-medium text-stone-800">{item.title}</p>
                  <p className="text-sm text-stone-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Worked example */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Worked example — typical Airbnb booking</h2>
          <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-3 text-sm">
            <p className="text-stone-500 text-xs uppercase tracking-wide font-medium">4-night stay, £480 guest price, self-catering</p>
            <div className="space-y-2">
              <div className="flex justify-between text-stone-700"><span>Guest-paid price (accommodation)</span><span>£480.00</span></div>
              <div className="flex justify-between text-stone-700"><span>Nights (under 5-night cap)</span><span>4 nights</span></div>
              <div className="flex justify-between text-stone-700"><span>Levy: £480 × 5%</span><span>£24.00</span></div>
              <div className="flex justify-between text-stone-400 text-xs"><span>Airbnb commission (not relevant to levy)</span><span>ignored</span></div>
              <div className="border-t border-stone-100 pt-2 flex justify-between font-semibold text-stone-900"><span>Levy to include in your quarterly return</span><span>£24.00</span></div>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 mt-2">
              At quarter-end: sum the levy for all bookings, deduct 2% host retention, and remit the balance to Edinburgh Council via visitorlevy.scot.
            </div>
          </div>
        </section>

        {/* Pre-commencement */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">Pre-commencement exemption for Airbnb bookings</h2>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-medium text-amber-900 text-sm">Bookings made and fully paid before 1 October 2025 are exempt</p>
            <p className="text-sm text-amber-800 mt-2 leading-relaxed">
              If a guest booked and paid in full via Airbnb before 1 October 2025, no levy is due regardless of the stay date. Part payments do not qualify — the booking must have been fully settled. Check your Airbnb booking history and mark these as exempt in your records.
            </p>
          </div>
        </section>

        {/* Key figures */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">Key figures for Edinburgh Airbnb hosts</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Levy rate', value: '5%', note: 'of guest-paid price' },
              { label: 'Night cap', value: '5 nights', note: 'per stay' },
              { label: 'Host retention', value: '2%', note: 'of levy collected' },
              { label: 'Q4 2026 deadline', value: '31 Jan 2027', note: 'Oct–Dec 2026' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-xs text-stone-500">{f.label}</p>
                <p className="mt-1 text-base font-bold text-stone-900">{f.value}</p>
                <p className="text-xs text-stone-400">{f.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Calculator */}
        <section className="space-y-4" id="calculator">
          <h2 className="text-lg font-semibold text-stone-900">Calculate your Edinburgh levy</h2>
          <p className="text-sm text-stone-500">Enter your Airbnb booking details. The 5-night cap and 2% retention are applied automatically.</p>
          <LevyCalculator defaultCouncil="edinburgh" defaultCheckIn="2026-11-01" defaultCheckOut="2026-11-05" />
        </section>

        {/* FAQ */}
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

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> This guide is based on Levy Desk's interpretation of Edinburgh City Council's published guidance. Always verify with{' '}
          <a href="https://www.edinburgh.gov.uk/visitor-levy" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">the official Edinburgh guidance</a>{' '}
          before filing. Levy Desk does not provide legal or tax advice.
        </div>

        <section className="rounded-2xl bg-stone-900 px-8 py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Import your Airbnb bookings</h2>
          <p className="text-stone-400 max-w-lg mx-auto text-sm">
            Upload your Airbnb earnings CSV. Levy Desk calculates the levy for every booking — cap, exemptions, retention — and produces your quarterly return pack.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/account" className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors">
              Start for free
            </Link>
            <Link href="/edinburgh-visitor-levy/how-to-file" className="rounded-lg border border-stone-700 px-6 py-3 text-sm font-medium text-stone-300 hover:bg-stone-800 transition-colors">
              Step-by-step filing guide
            </Link>
          </div>
        </section>

      </main>
      <MarketingFooter />
    </div>
  )
}
