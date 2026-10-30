import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { LevyCalculator } from '@/components/marketing/levy-calculator'
import { DeadlineBanner } from '@/components/marketing/deadline-banner'

export const revalidate = 3600

export const metadata: Metadata = {
  title: { absolute: 'Edinburgh Visitor Levy — Rates, Rules & Calculator 2026 | Levy Desk' },
  description:
    'Edinburgh charges a 5% visitor levy on holiday let gross income, capped at 5 nights per stay. Quarterly returns, 2% host retention. Free calculator for Airbnb and self-catering hosts.',
  keywords: [
    'Edinburgh visitor levy',
    'Edinburgh tourist tax',
    'Edinburgh visitor levy Airbnb',
    'Edinburgh visitor levy calculator',
    'Edinburgh visitor levy exemptions',
    'Edinburgh visitor levy filing deadline',
    'Edinburgh visitor levy self-catering',
  ],
  alternates: { canonical: '/edinburgh-visitor-levy' },
  openGraph: {
    title: 'Edinburgh Visitor Levy — Rates, Rules & Calculator 2026',
    description:
      '5% levy on gross income, 5-night cap, quarterly returns. Free calculator for Edinburgh holiday let hosts.',
    type: 'article',
    locale: 'en_GB',
    siteName: 'Levy Desk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edinburgh Visitor Levy — Rates, Rules & Calculator 2026',
    description: '5% levy on gross income, 5-night cap, quarterly returns. Free calculator for Edinburgh holiday let hosts.',
  },
}

const FILING_DEADLINES = [
  { quarter: 'Q3 2026', period: '1 Jul – 30 Sep 2026', due: '31 Oct 2026', status: 'past' },
  { quarter: 'Q4 2026', period: '1 Oct – 31 Dec 2026', due: '31 Jan 2027', status: 'current' },
  { quarter: 'Q1 2027', period: '1 Jan – 31 Mar 2027', due: '30 Apr 2027', status: 'upcoming' },
  { quarter: 'Q2 2027', period: '1 Apr – 30 Jun 2027', due: '31 Jul 2027', status: 'upcoming' },
]

const FAQ = [
  {
    q: 'Does the Edinburgh visitor levy apply to my Airbnb bookings?',
    a: "Yes. The levy applies to all short-term accommodation, including Airbnb, self-catering cottages, B&Bs, and hotels. Even where Airbnb collects and remits the levy on your behalf, you are still legally required to file a quarterly return with the City of Edinburgh Council.",
  },
  {
    q: "What is Edinburgh's 5-night cap?",
    a: 'Edinburgh charges the levy on a maximum of 5 consecutive nights per stay, regardless of the total stay length. For a 10-night booking at £1,000, the levy is charged on 5/10 of the gross (£500) at 5%, giving a levy of £25. Levy Desk applies the cap automatically and shows the full working.',
  },
  {
    q: 'Are any Edinburgh bookings exempt from the levy?',
    a: 'Yes. A booking is fully exempt if it was both made and fully paid before 1 October 2025, regardless of the stay date. This is a one-time transitional exemption and does not apply to bookings made or paid after that date.',
  },
  {
    q: "What is Edinburgh's 2% host retention?",
    a: "Edinburgh allows accommodation providers to retain 2% of the levy collected as an administration fee before remitting the remainder to the council. If you collected £500 in levy across a quarter, you keep £10 and remit £490.",
  },
  {
    q: 'When are Edinburgh visitor levy returns due?',
    a: 'Edinburgh uses quarterly calendar returns. Returns are due at the end of the month following the quarter end: Q4 2026 (Oct–Dec) is due 31 January 2027; Q1 2027 (Jan–Mar) is due 30 April 2027.',
  },
  {
    q: 'Do I owe VAT on the Edinburgh levy?',
    a: 'Only if your business is VAT-registered. If it is, you charge 20% VAT on top of the levy and remit both to the council. Levy Desk calculates and breaks this out separately in the return pack.',
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
      { '@type': 'ListItem', position: 2, name: 'Edinburgh Visitor Levy', item: 'https://www.levydesk.co.uk/edinburgh-visitor-levy' },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function EdinburghVisitorLevyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf8f2' }}>
      <FaqSchema />
      <BreadcrumbSchema />
      <MarketingNav />
      <DeadlineBanner />

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-16">

        {/* Breadcrumb */}
        <nav className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-700">Levy Desk</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">Edinburgh Visitor Levy</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Live from 24 Jul 2026
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              Scotland
            </span>
            <span className="text-xs text-stone-400">
              Last reviewed: October 2026 &middot;{' '}
              <a
                href="https://www.edinburgh.gov.uk/visitor-levy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-stone-600"
              >
                City of Edinburgh Council
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
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Edinburgh Visitor Levy
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl leading-relaxed">
            A 5% levy on gross holiday let income, capped at 5 nights per stay. Quarterly returns, with a 2% host retention. Live since July 2026.
          </p>
        </div>

        {/* Key facts */}
        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Key facts at a glance</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Rate', value: '5%', note: 'of gross income' },
              { label: 'Night cap', value: '5 nights', note: 'per stay' },
              { label: 'Host retention', value: '2%', note: 'of levy collected' },
              { label: 'Filing', value: 'Quarterly', note: 'calendar quarters' },
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
          <h2 className="text-lg font-semibold text-stone-900">How Edinburgh's levy is calculated</h2>
          <p className="text-stone-600 leading-relaxed">
            Edinburgh charges <strong>5% of the gross guest-paid accommodation income</strong>, excluding any extras such as cleaning fees or damage deposits. For stays longer than 5 consecutive nights, only 5 nights' worth of income is used as the levy base.
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
                  <p className="font-medium text-stone-800">5-night stay, £600 gross</p>
                  <p className="text-stone-500">£600 &times; 5% = <strong>£30.00 levy</strong></p>
                </div>
                <span className="text-lg font-bold text-stone-900">£30.00</span>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-stone-800">7-night stay, £700 gross</p>
                  <p className="text-stone-500">5-night cap applies: (£700 &times; 5/7) &times; 5% = £500 &times; 5% = <strong>£25.00 levy</strong></p>
                </div>
                <span className="text-lg font-bold text-stone-900">£25.00</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-stone-500">
            VAT-registered businesses must also charge 20% VAT on the levy and remit it separately. Levy Desk breaks this out automatically.
          </p>
        </section>

        {/* Exemptions */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Exemptions</h2>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2">
            <p className="font-medium text-amber-900">Pre-commencement bookings</p>
            <p className="text-sm text-amber-800">
              Bookings that were <strong>both made and fully paid before 1 October 2025</strong> are exempt from the levy, regardless of the stay date. If a guest made the booking in September 2025 and paid in full at that time, no levy is due even if the stay is in 2027.
            </p>
          </div>
          <p className="text-stone-600 leading-relaxed text-sm">
            Stays of 32 nights or more are not exempt in Edinburgh (that exemption applies in Wales only). There is no occupancy-based exemption. Commercial properties operating as serviced apartments are treated the same as self-catering holiday lets.
          </p>
        </section>

        {/* Host retention */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">Host retention allowance</h2>
          <p className="text-stone-600 leading-relaxed">
            Edinburgh allows you to retain <strong>2% of the levy you collect</strong> as a contribution towards your administration costs before remitting the balance to the council.
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm space-y-2">
            <div className="flex justify-between text-stone-700">
              <span>Levy collected in quarter</span><span>£500.00</span>
            </div>
            <div className="flex justify-between text-stone-700">
              <span>Host retention (2%)</span><span className="text-green-700">keep £10.00</span>
            </div>
            <div className="flex justify-between font-semibold text-stone-900 border-t border-stone-100 pt-2">
              <span>Amount remitted to council</span><span>£490.00</span>
            </div>
          </div>
        </section>

        {/* Filing deadlines */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Filing deadlines</h2>
          <p className="text-stone-600 text-sm">
            Returns are due at the end of the calendar month following each quarter. You must file even for quarters with zero levy (a nil return).
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
                  <tr key={row.quarter} className={row.status === 'past' ? 'opacity-50' : ''}>
                    <td className="px-4 py-3 font-medium text-stone-900">{row.quarter}</td>
                    <td className="px-4 py-3 text-stone-600">{row.period}</td>
                    <td className="px-4 py-3 text-stone-600">{row.due}</td>
                    <td className="px-4 py-3">
                      {row.status === 'past' && <span className="text-stone-400">Past</span>}
                      {row.status === 'current' && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Current</span>}
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
          <h2 className="text-lg font-semibold text-stone-900">Calculate your Edinburgh levy</h2>
          <p className="text-sm text-stone-500">
            Enter your booking details below. The calculator applies the correct Edinburgh rate, 5-night cap, and VAT rules instantly.
          </p>
          <LevyCalculator
            defaultCouncil="edinburgh"
            defaultCheckIn="2026-11-01"
            defaultCheckOut="2026-11-06"
          />
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-stone-200 bg-white"
              >
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

        {/* Related guides */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Guides for Edinburgh hosts</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { href: '/edinburgh-visitor-levy/how-to-file', title: 'How to file your return', desc: 'Step-by-step: register, calculate, apply retention, submit.' },
              { href: '/edinburgh-visitor-levy/airbnb-hosts', title: 'Guide for Airbnb hosts', desc: 'Airbnb will not collect the levy for you — here is what to do.' },
              { href: '/edinburgh-visitor-levy/what-if-i-miss-the-deadline', title: 'Missed the deadline?', desc: 'What penalties apply and how to minimise them.' },
            ].map((g) => (
              <Link key={g.href} href={g.href} className="rounded-xl border border-stone-200 bg-white p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                <p className="text-sm font-semibold text-stone-800">{g.title}</p>
                <p className="text-xs text-stone-500 mt-1">{g.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-stone-900 px-8 py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Ready to file your Edinburgh return?</h2>
          <p className="text-stone-400 max-w-lg mx-auto text-sm">
            Levy Desk imports your bookings, applies the correct Edinburgh rules, and produces a ready-to-file return pack. Free to start.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/account"
              className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
            >
              Start for free
            </Link>
            <Link
              href="/edinburgh-visitor-levy/how-to-file"
              className="rounded-lg border border-stone-700 px-6 py-3 text-sm font-medium text-stone-300 hover:bg-stone-800 transition-colors"
            >
              Step-by-step filing guide
            </Link>
          </div>
        </section>

      </main>

      <MarketingFooter />
    </div>
  )
}
