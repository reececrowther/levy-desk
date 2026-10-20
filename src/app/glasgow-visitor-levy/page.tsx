import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { LevyCalculator } from '@/components/marketing/levy-calculator'

export const metadata: Metadata = {
  title: { absolute: 'Glasgow Visitor Levy — Rates, Rules & Calculator 2027 | Levy Desk' },
  description:
    "Glasgow's 5% visitor levy on holiday let gross income starts January 2027. No night cap. Quarterly returns. Free calculator and filing guide for Glasgow Airbnb and self-catering hosts.",
  keywords: [
    'Glasgow visitor levy',
    'Glasgow tourist tax',
    'Glasgow visitor levy 2027',
    'Glasgow visitor levy Airbnb',
    'Glasgow visitor levy calculator',
    'Glasgow visitor levy self-catering',
    'Scotland visitor levy Glasgow',
  ],
  alternates: { canonical: '/glasgow-visitor-levy' },
  openGraph: {
    title: 'Glasgow Visitor Levy — Rates, Rules & Calculator 2027',
    description:
      '5% levy on gross income from January 2027. No night cap. Free calculator and quarterly filing guide for Glasgow hosts.',
    type: 'article',
    locale: 'en_GB',
    siteName: 'Levy Desk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glasgow Visitor Levy — Rates, Rules & Calculator 2027',
    description: '5% levy on gross income from January 2027. No night cap. Free calculator for Glasgow hosts.',
  },
}

const FILING_DEADLINES = [
  { quarter: 'Q1 2027', period: '1 Jan – 31 Mar 2027', due: '30 Apr 2027', status: 'first' },
  { quarter: 'Q2 2027', period: '1 Apr – 30 Jun 2027', due: '31 Jul 2027', status: 'upcoming' },
  { quarter: 'Q3 2027', period: '1 Jul – 30 Sep 2027', due: '31 Oct 2027', status: 'upcoming' },
  { quarter: 'Q4 2027', period: '1 Oct – 31 Dec 2027', due: '31 Jan 2028', status: 'upcoming' },
]

const FAQ = [
  {
    q: 'When does the Glasgow visitor levy start?',
    a: "Glasgow's visitor levy is confirmed to start from 1 January 2027. The exact start date has been confirmed in principle but operators should monitor Glasgow City Council's website for the formal commencement order.",
  },
  {
    q: "How is Glasgow's levy different from Edinburgh's?",
    a: "The rate is the same at 5% of gross accommodation income, but Glasgow does not apply a night cap. In Edinburgh, the levy is charged on a maximum of 5 consecutive nights per stay. In Glasgow, every night of a long stay is charged. Glasgow also has no host retention allowance, unlike Edinburgh's 2%.",
  },
  {
    q: 'Does Glasgow levy apply to Airbnb and short-term lets?',
    a: "Yes. The levy applies to all short-term accommodation providers in Glasgow, including Airbnb, VRBO, direct bookings, and self-catering properties. Even if a platform collects the levy on your behalf, you must still file a quarterly return.",
  },
  {
    q: 'What do I need to do now to prepare for the Glasgow levy?',
    a: 'Start by registering with Glasgow City Council as an accommodation provider. Ensure your booking records are complete from the start date. Levy Desk can import your Airbnb or booking software exports and calculate the correct levy for each booking automatically.',
  },
  {
    q: 'Will there be a transitional exemption like Edinburgh had?',
    a: "Glasgow City Council has not confirmed a pre-commencement booking exemption equivalent to Edinburgh's. Until an exemption is formally announced, all bookings with stays commencing on or after the start date should be treated as liable. Levy Desk flags any uncertainty as an exception for your review.",
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
      { '@type': 'ListItem', position: 2, name: 'Glasgow Visitor Levy', item: 'https://www.levydesk.co.uk/glasgow-visitor-levy' },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function GlasgowVisitorLevyPage() {
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
          <span className="text-stone-800">Glasgow Visitor Levy</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              From 1 Jan 2027
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              Scotland
            </span>
            <span className="text-xs text-stone-400">
              Last reviewed: October 2026 &middot;{' '}
              <a
                href="https://www.glasgow.gov.uk/visitorlevy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-stone-600"
              >
                Glasgow City Council
              </a>
              {' '}&middot;{' '}
              <a
                href="https://www.legislation.gov.uk/asp/2024/7/contents"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-stone-600"
              >
                Visitor Levy (Scotland) Act 2024
              </a>
              {' '}<span className="text-amber-600 font-medium">(start date unverified — pending formal commencement order)</span>
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Glasgow Visitor Levy
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl leading-relaxed">
            A 5% levy on gross holiday let income, with no night cap. Quarterly returns from January 2027. No host retention allowance.
          </p>
        </div>

        {/* Key facts */}
        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Key facts at a glance</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Rate', value: '5%', note: 'of gross income' },
              { label: 'Night cap', value: 'None', note: 'all nights charged' },
              { label: 'Host retention', value: 'None', note: 'full levy remitted' },
              { label: 'Filing', value: 'Quarterly', note: 'from Q1 2027' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-xs text-stone-500">{f.label}</p>
                <p className="mt-1 text-xl font-bold text-stone-900">{f.value}</p>
                <p className="text-xs text-stone-400">{f.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it's calculated */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">How Glasgow's levy is calculated</h2>
          <p className="text-stone-600 leading-relaxed">
            Glasgow charges <strong>5% of the gross guest-paid accommodation income</strong> for every night of the stay, with no upper cap on nights. Unlike Edinburgh, a 10-night stay is charged on all 10 nights, not just 5.
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Worked examples</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-stone-100 pb-3">
                <div>
                  <p className="font-medium text-stone-800">3-night stay, £300 gross</p>
                  <p className="text-stone-500">£300 &times; 5% = <strong>£15.00 levy</strong></p>
                </div>
                <span className="text-lg font-bold text-stone-900">£15.00</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-3">
                <div>
                  <p className="font-medium text-stone-800">7-night stay, £700 gross</p>
                  <p className="text-stone-500">£700 &times; 5% = <strong>£35.00 levy</strong> (no cap in Glasgow)</p>
                </div>
                <span className="text-lg font-bold text-stone-900">£35.00</span>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-stone-800">14-night stay, £1,400 gross</p>
                  <p className="text-stone-500">£1,400 &times; 5% = <strong>£70.00 levy</strong></p>
                </div>
                <span className="text-lg font-bold text-stone-900">£70.00</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
            <strong>Edinburgh vs Glasgow:</strong> For a 7-night, £700 stay, Edinburgh charges £25 (5-night cap). Glasgow charges £35 (no cap). The difference grows with longer stays.
          </div>
        </section>

        {/* Preparation checklist */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">How to prepare before January 2027</h2>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Register with Glasgow City Council', desc: 'Monitor Glasgow City Council for the formal registration process for accommodation providers.' },
              { step: '2', title: 'Audit your bookings from 1 Jan 2027', desc: 'Every confirmed booking with a check-in on or after the start date will be liable. Ensure your records are complete.' },
              { step: '3', title: 'Update your pricing and guest information', desc: 'The levy is a charge to the guest. Review your listing pricing and ensure guests are informed at the point of booking.' },
              { step: '4', title: 'Set up your filing system', desc: 'Levy Desk imports Airbnb, Booking.com and other exports, calculates the levy, and queues your quarterly return for filing.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-medium text-stone-800">{item.title}</p>
                  <p className="text-sm text-stone-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filing deadlines */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Filing deadlines</h2>
          <p className="text-stone-600 text-sm">
            Glasgow follows the same quarterly calendar pattern as Edinburgh. The first return covers Q1 2027.
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
          <h2 className="text-lg font-semibold text-stone-900">Calculate your Glasgow levy</h2>
          <p className="text-sm text-stone-500">
            Enter your booking details. The calculator pre-selects Glasgow and uses dates after the January 2027 start date.
          </p>
          <LevyCalculator
            defaultCouncil="glasgow"
            defaultCheckIn="2027-01-15"
            defaultCheckOut="2027-01-20"
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
          <h2 className="text-2xl font-bold text-white">Get ready for Glasgow's levy</h2>
          <p className="text-stone-400 max-w-lg mx-auto text-sm">
            Start importing your bookings now so you're ready to file the moment Glasgow's levy goes live in January 2027.
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
