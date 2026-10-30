import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export const metadata: Metadata = {
  title: { absolute: 'Scotland and Wales Visitor Levy Tracker — Every Council, Rates and Dates | Levy Desk' },
  description:
    'Complete tracker of every confirmed visitor levy in Scotland and Wales. Rates, night caps, host retention, start dates and filing portals for Edinburgh, Glasgow, Aberdeen, Stirling, Cardiff and more.',
  keywords: [
    'scotland visitor levy councils',
    'visitor levy scotland all councils',
    'scotland visitor levy tracker',
    'scotland tourist tax councils list',
    'visitor levy rates scotland wales',
    'scotland visitor levy which councils',
  ],
  alternates: { canonical: '/visitor-levy-tracker' },
  openGraph: {
    title: 'Scotland and Wales Visitor Levy Tracker',
    description: 'Every confirmed visitor levy — rates, caps, host retention and start dates for Edinburgh, Glasgow, Aberdeen, Stirling, West Dunbartonshire, and Cardiff.',
    type: 'website',
    locale: 'en_GB',
    siteName: 'Levy Desk',
  },
}

const CONFIRMED = [
  {
    name: 'Edinburgh',
    country: 'Scotland',
    status: 'Live',
    liveFrom: '24 Jul 2026',
    rate: '5% of gross',
    cap: '5 nights per stay',
    retention: '2% of levy',
    portal: 'visitorlevy.scot',
    portalUrl: 'https://www.visitorlevy.scot',
    legislation: 'Visitor Levy (Scotland) Act 2024',
    guideHref: '/edinburgh-visitor-levy',
    howToFileHref: '/edinburgh-visitor-levy/how-to-file',
    notes: 'UK\'s first live visitor levy. Pre-commencement exemption for bookings made and fully paid before 1 Oct 2025.',
  },
  {
    name: 'Glasgow',
    country: 'Scotland',
    status: 'Confirmed',
    liveFrom: '25 Jan 2027',
    rate: '5% of gross',
    cap: 'None — full stay charged',
    retention: '1.5% of levy',
    portal: 'visitorlevy.scot',
    portalUrl: 'https://www.visitorlevy.scot',
    legislation: 'Visitor Levy (Scotland) Act 2024',
    guideHref: '/glasgow-visitor-levy',
    howToFileHref: null,
    notes: 'Bookings made on or after 1 Apr 2026 for stays from 25 Jan 2027 are liable. Registration codes issued Oct 2026.',
  },
  {
    name: 'Aberdeen',
    country: 'Scotland',
    status: 'Confirmed',
    liveFrom: '1 Apr 2027',
    rate: '7% of gross',
    cap: 'None confirmed',
    retention: 'TBC',
    portal: 'visitorlevy.scot',
    portalUrl: 'https://www.visitorlevy.scot',
    legislation: 'Visitor Levy (Scotland) Act 2024',
    guideHref: null,
    howToFileHref: null,
    notes: 'Highest rate of any confirmed Scottish scheme. Details pending.',
  },
  {
    name: 'Stirling',
    country: 'Scotland',
    status: 'Confirmed',
    liveFrom: '14 Jun 2027',
    rate: '3% of gross',
    cap: '7 nights per stay',
    retention: 'TBC',
    portal: 'visitorlevy.scot',
    portalUrl: 'https://www.visitorlevy.scot',
    legislation: 'Visitor Levy (Scotland) Act 2024',
    guideHref: null,
    howToFileHref: null,
    notes: 'Lowest rate of confirmed Scottish schemes. Details pending.',
  },
  {
    name: 'West Dunbartonshire',
    country: 'Scotland',
    status: 'Confirmed',
    liveFrom: '1 Jul 2027',
    rate: '5% of gross',
    cap: 'None confirmed',
    retention: 'TBC',
    portal: 'visitorlevy.scot',
    portalUrl: 'https://www.visitorlevy.scot',
    legislation: 'Visitor Levy (Scotland) Act 2024',
    guideHref: null,
    howToFileHref: null,
    notes: 'Details pending.',
  },
  {
    name: 'Cardiff',
    country: 'Wales',
    status: 'Confirmed',
    liveFrom: '1 Apr 2027',
    rate: '£1.30/person/night',
    cap: 'Stays of 32+ nights exempt',
    retention: 'None confirmed',
    portal: 'Welsh Revenue Authority',
    portalUrl: 'https://www.gov.wales/visitor-accommodation-levy',
    legislation: 'Visitor Accommodation (Wales) Act 2024',
    guideHref: '/cardiff-tourism-levy',
    howToFileHref: null,
    notes: 'Filed with the Welsh Revenue Authority (WRA), not Cardiff Council. Lower rate of £0.75 for hostels and campsites. Under-18s exempt.',
  },
]

const CONSIDERING = [
  { name: 'Highland', country: 'Scotland', notes: 'Decision expected December 2026.' },
  { name: 'Argyll & Bute', country: 'Scotland', notes: 'Stepped back from introducing a levy as of 2026.' },
  { name: 'East Ayrshire', country: 'Scotland', notes: 'Stepped back from introducing a levy as of 2026.' },
  { name: 'Dundee City', country: 'Scotland', notes: 'Considering — no date confirmed.' },
  { name: 'East Lothian', country: 'Scotland', notes: 'Considering — no date confirmed.' },
  { name: 'Perth & Kinross', country: 'Scotland', notes: 'Considering — no date confirmed.' },
  { name: 'Falkirk', country: 'Scotland', notes: 'Considering — no date confirmed.' },
]

const statusColour: Record<string, string> = {
  Live: 'bg-green-100 text-green-700',
  Confirmed: 'bg-blue-100 text-blue-700',
}

export default function VisitorLevyTrackerPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf8f2' }}>
      <MarketingNav />

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-16">

        <nav className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-700">Levy Desk</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">Visitor Levy Tracker</span>
        </nav>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">Scotland &amp; Wales</span>
            <span className="text-xs text-stone-400">Last updated: October 2026</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">
            Visitor Levy Tracker
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl leading-relaxed">
            Every confirmed visitor levy in Scotland and Wales — rates, night caps, host retention, and start dates in one place.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Live now', value: '1', note: 'Edinburgh' },
            { label: 'Confirmed 2027', value: '5', note: 'Glasgow, Aberdeen, Stirling, West Dunb., Cardiff' },
            { label: 'Highest rate', value: '7%', note: 'Aberdeen (gross)' },
            { label: 'Lowest rate', value: '3%', note: 'Stirling (gross)' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="text-xs text-stone-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-stone-900">{s.value}</p>
              <p className="text-xs text-stone-400 mt-0.5">{s.note}</p>
            </div>
          ))}
        </div>

        {/* Confirmed schemes */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Confirmed schemes</h2>
          <div className="space-y-4">
            {CONFIRMED.map((council) => (
              <div key={council.name} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 px-5 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColour[council.status]}`}>
                    {council.status}
                  </span>
                  <h3 className="font-semibold text-stone-900">{council.name}</h3>
                  <span className="text-xs text-stone-400">{council.country}</span>
                  <span className="ml-auto text-xs font-medium text-stone-600">From {council.liveFrom}</span>
                </div>
                <div className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-stone-400">Rate</p>
                    <p className="font-medium text-stone-800 mt-0.5">{council.rate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Night cap</p>
                    <p className="font-medium text-stone-800 mt-0.5">{council.cap}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Host retention</p>
                    <p className="font-medium text-stone-800 mt-0.5">{council.retention}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Filing portal</p>
                    <a href={council.portalUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-orange-600 hover:underline mt-0.5 block">
                      {council.portal} ↗
                    </a>
                  </div>
                </div>
                {council.notes && (
                  <div className="border-t border-stone-100 px-5 py-3">
                    <p className="text-xs text-stone-500">{council.notes}</p>
                  </div>
                )}
                {(council.guideHref || council.howToFileHref) && (
                  <div className="border-t border-stone-100 px-5 py-3 flex gap-3">
                    {council.guideHref && (
                      <Link href={council.guideHref} className="text-xs font-medium text-orange-600 hover:underline">
                        Rates &amp; rules guide →
                      </Link>
                    )}
                    {council.howToFileHref && (
                      <Link href={council.howToFileHref} className="text-xs font-medium text-stone-600 hover:underline">
                        How to file →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Considering */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Councils considering a levy</h2>
          <p className="text-sm text-stone-500">
            All 32 Scottish councils and all Welsh councils have the power to introduce a visitor levy. Two-thirds of Scottish councils are actively considering it. Levy Desk will add new councils here as they confirm their schemes.
          </p>
          <div className="overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Council</th>
                  <th className="px-4 py-3 text-left font-medium">Country</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {CONSIDERING.map((c) => (
                  <tr key={c.name} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium text-stone-800">{c.name}</td>
                    <td className="px-4 py-3 text-stone-500">{c.country}</td>
                    <td className="px-4 py-3 text-stone-500 text-xs">{c.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Legislation */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">Legislation</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="text-xs text-stone-500 mb-1">Scotland</p>
              <a href="https://www.legislation.gov.uk/asp/2024/7/contents" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-orange-600 hover:underline">
                Visitor Levy (Scotland) Act 2024 ↗
              </a>
              <p className="text-xs text-stone-400 mt-1">Gives Scottish councils power to charge a visitor levy on overnight stays.</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="text-xs text-stone-500 mb-1">Wales</p>
              <a href="https://www.legislation.gov.uk/asc/2024/2/contents" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-orange-600 hover:underline">
                Visitor Accommodation (Wales) Act 2024 ↗
              </a>
              <p className="text-xs text-stone-400 mt-1">Introduces the Welsh Visitor Accommodation Levy, administered by the Welsh Revenue Authority.</p>
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <strong>Note:</strong> Rates, dates and scheme details are based on official council publications at the time of last review. Some details for 2027 schemes are subject to formal confirmation. Levy Desk updates this page as new information is published.
        </div>

        <section className="rounded-2xl bg-stone-900 px-8 py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Properties in multiple councils?</h2>
          <p className="text-stone-400 max-w-lg mx-auto text-sm">
            Levy Desk handles Edinburgh, Glasgow, Aberdeen, Stirling, West Dunbartonshire, and Cardiff in one workspace. Import your bookings once — the right rules apply per property automatically.
          </p>
          <Link href="/account" className="inline-block rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors">
            Start for free
          </Link>
        </section>

      </main>
      <MarketingFooter />
    </div>
  )
}
