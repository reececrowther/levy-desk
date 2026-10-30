import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { LevyCalculator } from '@/components/marketing/levy-calculator'

export const metadata: Metadata = {
  title: { absolute: 'Cardiff Tourism Levy — Wales VAL Guide 2027 | Levy Desk' },
  description:
    "Cardiff's Welsh Visitor Accommodation Levy starts April 2027. £1.30 per person per night (£0.75 for hostels and campsites). Under-18s and stays over 31 nights are exempt. Free calculator.",
  keywords: [
    'Cardiff tourism levy',
    'Cardiff visitor levy',
    'Welsh visitor accommodation levy Cardiff',
    'Cardiff tourist tax',
    'Cardiff visitor levy Airbnb',
    'Wales visitor accommodation levy',
    'Cardiff visitor levy calculator',
    'Cardiff visitor levy 2027',
  ],
  alternates: { canonical: '/cardiff-tourism-levy' },
  openGraph: {
    title: 'Cardiff Tourism Levy — Welsh Visitor Accommodation Levy 2027',
    description:
      '£1.30 per person per night from April 2027. Under-18s exempt, stays over 31 nights exempt. Free calculator for Cardiff hosts.',
    type: 'article',
    locale: 'en_GB',
    siteName: 'Levy Desk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cardiff Tourism Levy — Welsh Visitor Accommodation Levy 2027',
    description: '£1.30 per person per night from April 2027. Free calculator for Cardiff holiday let hosts.',
  },
}

const FILING_DEADLINES = [
  { quarter: 'Q2 2027', period: '1 Apr – 30 Jun 2027', due: '31 Jul 2027', status: 'first' },
  { quarter: 'Q3 2027', period: '1 Jul – 30 Sep 2027', due: '31 Oct 2027', status: 'upcoming' },
  { quarter: 'Q4 2027', period: '1 Oct – 31 Dec 2027', due: '31 Jan 2028', status: 'upcoming' },
  { quarter: 'Q1 2028', period: '1 Jan – 31 Mar 2028', due: '30 Apr 2028', status: 'upcoming' },
]

const FAQ = [
  {
    q: "How is Cardiff's levy different from Scotland's visitor levy?",
    a: "Scotland's levy (Edinburgh, Glasgow) is a percentage of gross accommodation income. Cardiff's Welsh Visitor Accommodation Levy is charged per person per night at a flat rate — £1.30 for most accommodation types, or £0.75 for hostels and campsites. This means the levy in Cardiff does not scale with the accommodation price.",
  },
  {
    q: 'Are under-18s exempt from the Cardiff levy?',
    a: "Yes. Guests who are under 18 years old at the time of the stay pay nothing. Only adult guests are counted at the standard or lower rate. You must record the number of adults and under-18s per booking to calculate correctly.",
  },
  {
    q: 'Are long-stay guests exempt from the Cardiff levy?',
    a: "Yes. Stays of 32 nights or more are entirely exempt from the Welsh Visitor Accommodation Levy. A stay of exactly 31 nights is still liable. If a guest extends their stay past 31 nights, the entire booking becomes exempt.",
  },
  {
    q: 'Which accommodation types pay the lower £0.75 rate in Cardiff?',
    a: "Hostels (dormitory-style) and campsites pay £0.75 per adult per night rather than the standard £1.30. B&Bs, self-catering properties, hotels, and guest houses all pay the standard £1.30 rate. Under-18s pay nothing regardless of accommodation type.",
  },
  {
    q: 'Does the Cardiff levy apply to Airbnb and holiday let bookings?',
    a: "Yes. The Welsh Visitor Accommodation Levy applies to all short-term residential accommodation in Cardiff, including Airbnb, VRBO, and direct holiday let bookings. Returns are filed with the Welsh Revenue Authority (WRA) from April 2027.",
  },
  {
    q: 'Do I need a Welsh Tourism Accommodation Register number?',
    a: "Wales introduced a mandatory tourism accommodation registration scheme from October 2024. You need a Welsh Tourism Accommodation Register (WTAR) number to legally operate a short-term let in Cardiff. Levy Desk stores your register number on each property for inclusion in returns.",
  },
]

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
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function BreadcrumbSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Levy Desk', item: 'https://www.levydesk.co.uk' },
      { '@type': 'ListItem', position: 2, name: 'Cardiff Tourism Levy', item: 'https://www.levydesk.co.uk/cardiff-tourism-levy' },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function CardiffTourismLevyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf8f2' }}>
      <FaqSchema />
      <BreadcrumbSchema />
      <MarketingNav />

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-16">

        {/* Breadcrumb */}
        <nav className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-700">Levy Desk</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">Cardiff Tourism Levy</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              From 1 Apr 2027
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              Wales
            </span>
            <span className="text-xs text-stone-400">
              Last reviewed: October 2026 &middot;{' '}
              <a
                href="https://www.gov.wales/visitor-accommodation-levy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-stone-600"
              >
                Welsh Government
              </a>
              {' '}&middot;{' '}
              <a
                href="https://www.legislation.gov.uk/asc/2024/2/contents"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-stone-600"
              >
                Visitor Accommodation (Wales) Act 2024
              </a>
                </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Cardiff Tourism Levy
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl leading-relaxed">
            The Welsh Visitor Accommodation Levy charges £1.30 per adult per night in Cardiff from April 2027. Under-18s are free. Stays of 32 nights or more are fully exempt.
          </p>
        </div>

        {/* Key facts */}
        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Key facts at a glance</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Standard rate', value: '£1.30', note: 'per adult per night' },
              { label: 'Lower rate', value: '£0.75', note: 'hostels and campsites' },
              { label: 'Under-18s', value: 'Free', note: 'always exempt' },
              { label: 'Long stays', value: '32+ nights', note: 'fully exempt' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-xs text-stone-500">{f.label}</p>
                <p className="mt-1 text-xl font-bold text-stone-900">{f.value}</p>
                <p className="text-xs text-stone-400">{f.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">How Cardiff's levy is calculated</h2>
          <p className="text-stone-600 leading-relaxed">
            Unlike Scotland's percentage-based levy, the Welsh Visitor Accommodation Levy is a <strong>flat rate per person per night</strong>. You count the number of adults staying, multiply by the number of nights, and apply the rate. Under-18s count as zero.
          </p>

          {/* Rate table */}
          <div className="overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Accommodation type</th>
                  <th className="px-4 py-3 text-left font-medium">Rate per adult per night</th>
                  <th className="px-4 py-3 text-left font-medium">Under-18s</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr>
                  <td className="px-4 py-3">Self-catering, holiday let, B&B, guest house, hotel</td>
                  <td className="px-4 py-3 font-semibold">£1.30</td>
                  <td className="px-4 py-3 text-stone-400">Free</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Hostel (dormitory), campsite</td>
                  <td className="px-4 py-3 font-semibold">£0.75</td>
                  <td className="px-4 py-3 text-stone-400">Free</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Worked examples</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-stone-100 pb-3">
                <div>
                  <p className="font-medium text-stone-800">2 adults, 5 nights, self-catering</p>
                  <p className="text-stone-500">2 adults &times; 5 nights &times; £1.30 = <strong>£13.00 levy</strong></p>
                </div>
                <span className="text-lg font-bold text-stone-900">£13.00</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-3">
                <div>
                  <p className="font-medium text-stone-800">2 adults + 2 under-18s, 3 nights, holiday let</p>
                  <p className="text-stone-500">2 adults &times; 3 nights &times; £1.30 = <strong>£7.80 levy</strong> (under-18s free)</p>
                </div>
                <span className="text-lg font-bold text-stone-900">£7.80</span>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-stone-800">4 adults, 40 nights, self-catering</p>
                  <p className="text-stone-500">Stay exceeds 31 nights: <strong>£0 levy</strong> (fully exempt)</p>
                </div>
                <span className="text-lg font-bold text-green-700">Exempt</span>
              </div>
            </div>
          </div>
        </section>

        {/* Exemptions */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Exemptions</h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <p className="font-medium text-stone-800 text-sm">Under-18s</p>
              <p className="text-sm text-stone-600 mt-1">
                Guests under 18 at the time of the stay pay nothing. You must record and track the number of under-18s per booking. Levy Desk stores this per booking and excludes them from the levy calculation automatically.
              </p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <p className="font-medium text-stone-800 text-sm">Long stays (32 nights or more)</p>
              <p className="text-sm text-stone-600 mt-1">
                Any stay of 32 consecutive nights or more is entirely exempt. A stay of exactly 31 nights is still liable. If a guest extends past 31 nights, the whole booking becomes exempt. Levy Desk detects this automatically and flags it as a nil-levy booking.
              </p>
            </div>
          </div>
        </section>

        {/* Welsh registration */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">Welsh Tourism Accommodation Register</h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            Wales requires all short-term accommodation providers to register on the Welsh Tourism Accommodation Register (WTAR) — a separate requirement from the visitor levy. Registration has been mandatory since October 2024. Your WTAR number must be included in levy returns. Levy Desk stores a WTAR number per property and includes it in generated return packs.
          </p>
        </section>

        {/* Filing deadlines */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Filing deadlines</h2>
          <p className="text-stone-600 text-sm">
            Cardiff follows quarterly calendar returns. The first return covers Q2 2027 (the first full quarter after the April 2027 start).
          </p>
          <div className="overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Quarter</th>
                  <th className="px-4 py-3 text-left font-medium">Period</th>
                  <th className="px-4 py-3 text-left font-medium">Due date</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {FILING_DEADLINES.map((row) => (
                  <tr key={row.quarter}>
                    <td className="px-4 py-3 font-medium text-stone-900">{row.quarter}</td>
                    <td className="px-4 py-3 text-stone-600">{row.period}</td>
                    <td className="px-4 py-3 text-stone-600">{row.due}</td>
                    <td className="px-4 py-3">
                      {row.status === 'first' && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">First return</span>}
                      {row.status === 'upcoming' && <span className="text-stone-400">Upcoming</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Calculator */}
        <section className="space-y-4" id="calculator">
          <h2 className="text-lg font-semibold text-stone-900">Calculate your Cardiff levy</h2>
          <p className="text-sm text-stone-500">
            Enter the number of adults, under-18s, and stay length. The calculator applies the Welsh per-person rate and long-stay exemption automatically.
          </p>
          <LevyCalculator
            defaultCouncil="cardiff"
            defaultCheckIn="2027-04-10"
            defaultCheckOut="2027-04-15"
          />
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
                <div className="border-t border-stone-100 px-5 py-4 text-sm text-stone-600 leading-relaxed">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-stone-900 px-8 py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Ready for Cardiff's tourism levy?</h2>
          <p className="text-stone-400 max-w-lg mx-auto text-sm">
            Levy Desk handles the per-person calculation, under-18 exemptions, and long-stay rules automatically. Start importing your bookings now.
          </p>
          <Link
            href="/account"
            className="inline-block rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
          >
            Start for free
          </Link>
        </section>

      </main>

      <MarketingFooter />
    </div>
  )
}
