import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export const metadata: Metadata = {
  title: { absolute: 'What Happens if You Miss the Edinburgh Visitor Levy Deadline? | Levy Desk' },
  description:
    'Missed the Edinburgh visitor levy deadline? File immediately — a late return is always better than no return. Here is what penalties apply, how to contact the council, and how to avoid missing future deadlines.',
  keywords: [
    'Edinburgh visitor levy missed deadline',
    'Edinburgh visitor levy late filing',
    'Edinburgh visitor levy penalty',
    'Edinburgh tourist tax late return',
    'Edinburgh visitor levy overdue',
  ],
  alternates: { canonical: '/edinburgh-visitor-levy/what-if-i-miss-the-deadline' },
  openGraph: {
    title: 'What Happens if You Miss the Edinburgh Visitor Levy Deadline?',
    description: 'Missed the Edinburgh levy filing deadline? File immediately. Here is what penalties apply and how to minimise them.',
    type: 'article',
    locale: 'en_GB',
    siteName: 'Levy Desk',
  },
}

const DEADLINES = [
  { quarter: 'Q3 2026', period: '24 Jul – 30 Sep 2026', due: '31 Oct 2026' },
  { quarter: 'Q4 2026', period: '1 Oct – 31 Dec 2026', due: '31 Jan 2027' },
  { quarter: 'Q1 2027', period: '1 Jan – 31 Mar 2027', due: '30 Apr 2027' },
  { quarter: 'Q2 2027', period: '1 Apr – 30 Jun 2027', due: '31 Jul 2027' },
]

const FAQ = [
  {
    q: 'I missed the deadline by just a few days. Is that still penalised?',
    a: 'Edinburgh Council can apply a fixed penalty for any return filed after the deadline, regardless of how late it is. However, a small number of days late — especially for a first return — is more likely to result in a warning than an immediate penalty. File as soon as you realise, include a brief explanation, and contact the council helpdesk if you are concerned.',
  },
  {
    q: 'What if I had no bookings in the quarter — do I still need to file?',
    a: "Yes. You must file a nil return even if you had zero liable bookings. Failing to file a nil return carries the same risk of penalty as failing to file a return with levy due. A nil return takes seconds — log in to visitorlevy.scot and select 'Nil return' for the quarter.",
  },
  {
    q: 'What if I calculated the levy incorrectly in a previous return?',
    a: "Edinburgh's portal allows amendments to submitted returns within a limited window. If you discover an error after that window, the council advises correcting it in the next return or contacting the helpdesk directly. Voluntary disclosure of an error is always treated more favourably than an error the council finds itself.",
  },
  {
    q: 'Will Edinburgh Council contact me if I miss a return?',
    a: "Edinburgh Council will issue a reminder if a return is not filed by the deadline, followed by a formal notice if you still do not file. Do not wait for the council to chase you — interest and penalties can accumulate between the deadline and the date you are contacted. File proactively.",
  },
  {
    q: 'Can I appeal a penalty?',
    a: "Yes. Edinburgh's visitor levy penalty process includes a right of appeal. If you believe a penalty has been applied incorrectly or you had a genuine reasonable excuse (serious illness, bereavement, technical failure on the council portal), you can submit an appeal with supporting evidence.",
  },
]

function BreadcrumbSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Levy Desk', item: 'https://www.levydesk.co.uk' },
      { '@type': 'ListItem', position: 2, name: 'Edinburgh Visitor Levy', item: 'https://www.levydesk.co.uk/edinburgh-visitor-levy' },
      { '@type': 'ListItem', position: 3, name: 'What if I miss the deadline?', item: 'https://www.levydesk.co.uk/edinburgh-visitor-levy/what-if-i-miss-the-deadline' },
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

export default function WhatIfIMissDeadlinePage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf8f2' }}>
      <BreadcrumbSchema />
      <FaqSchema />
      <MarketingNav />

      <main className="mx-auto max-w-3xl px-6 py-12 space-y-12">

        <nav className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-700">Levy Desk</Link>
          <span className="mx-2">/</span>
          <Link href="/edinburgh-visitor-levy" className="hover:text-stone-700">Edinburgh Visitor Levy</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">What if I miss the deadline?</span>
        </nav>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Live from 24 Jul 2026</span>
            <span className="text-xs text-stone-400">Last reviewed: October 2026</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            What happens if you miss the Edinburgh visitor levy deadline?
          </h1>
          <p className="text-xl text-stone-600 leading-relaxed">
            A late return is always better than no return. File immediately, even if the deadline has passed.
          </p>
        </div>

        {/* Most important thing */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-6 py-5 space-y-2">
          <p className="font-semibold text-orange-900">The most important thing: file now</p>
          <p className="text-sm text-orange-800 leading-relaxed">
            If you have missed or are about to miss a deadline, stop reading and file your return first. Every day after the deadline that passes without a return filed is a day penalties and interest can accrue. Come back to understand the details once you have submitted.
          </p>
          <a
            href="https://www.visitorlevy.scot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
          >
            File on visitorlevy.scot ↗
          </a>
        </div>

        {/* What penalties apply */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">What penalties can Edinburgh Council apply?</h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            The Visitor Levy (Scotland) Act 2024 gives councils the power to impose penalties for late or missing returns. Edinburgh's specific penalty schedule is set out in the council's scheme. In general:
          </p>
          <div className="space-y-3">
            {[
              {
                label: 'Fixed late-filing penalty',
                desc: 'A fixed penalty applies for returns not filed by the deadline. The exact amount is set by Edinburgh Council. This applies regardless of whether any levy is actually owed — a nil return filed late can still attract a penalty.',
              },
              {
                label: 'Daily penalties',
                desc: 'If the return remains unfiled after the fixed penalty period, additional daily penalties can accumulate until the return is submitted.',
              },
              {
                label: 'Interest on unpaid levy',
                desc: "Interest is charged on any levy that remains unpaid after the payment deadline. This is separate from the filing penalty — you can file on time but still incur interest if you don't pay.",
              },
              {
                label: 'Late-payment surcharge',
                desc: 'An additional surcharge applies if payment is significantly overdue. The council can also pursue the debt through civil recovery.',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-stone-200 bg-white p-5">
                <p className="text-sm font-semibold text-stone-800">{item.label}</p>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            For the exact penalty amounts, see{' '}
            <a href="https://www.edinburgh.gov.uk/visitor-levy" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline hover:text-orange-700">
              Edinburgh Council's official visitor levy guidance
            </a>.
          </div>
        </section>

        {/* What to do now */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">What to do if you have missed a deadline</h2>
          <div className="space-y-3">
            {[
              { step: '1', title: 'File the return immediately', desc: 'Log in to visitorlevy.scot and submit the overdue return right now, even if you are not 100% certain of every figure. An estimated return filed today is better than a precise return filed next week. You can amend it afterwards.' },
              { step: '2', title: 'Pay any levy owed at the same time', desc: 'The filing and payment deadlines are linked. Paying immediately reduces interest from accumulating further, even if the return itself was late.' },
              { step: '3', title: 'Contact the council helpdesk', desc: 'If you had a genuine reason for the delay — serious illness, a bereavement, a failure of the council portal itself — contact Edinburgh Council and explain. Reasonable excuse can be grounds for a penalty to be reduced or waived.' },
              { step: '4', title: 'Keep evidence of your submission', desc: 'Download or screenshot your submission confirmation and payment receipt. You will need these if any dispute arises.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">{item.step}</span>
                <div>
                  <p className="text-sm font-medium text-stone-800">{item.title}</p>
                  <p className="text-sm text-stone-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming deadlines */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Edinburgh visitor levy deadlines</h2>
          <div className="overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Quarter</th>
                  <th className="px-4 py-3 text-left font-medium">Period</th>
                  <th className="px-4 py-3 text-left font-medium">Due date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {DEADLINES.map((row) => (
                  <tr key={row.quarter}>
                    <td className="px-4 py-3 font-medium text-stone-900">{row.quarter}</td>
                    <td className="px-4 py-3 text-stone-600">{row.period}</td>
                    <td className="px-4 py-3 font-semibold text-stone-800">{row.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <strong>Disclaimer:</strong> This page describes the general consequences of late filing under the Visitor Levy (Scotland) Act 2024 and Edinburgh's published scheme. Exact penalty amounts and processes may change. Always check{' '}
          <a href="https://www.edinburgh.gov.uk/visitor-levy" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">Edinburgh Council's official guidance</a>{' '}
          and seek professional advice if you are facing significant penalties.
        </div>

        <section className="rounded-2xl bg-stone-900 px-8 py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Never miss a deadline again</h2>
          <p className="text-stone-400 max-w-lg mx-auto text-sm">
            Levy Desk sends you a reminder before every filing deadline and produces your return pack in minutes — so late filing becomes a thing of the past.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/account" className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors">
              Start for free
            </Link>
            <Link href="/edinburgh-visitor-levy/how-to-file" className="rounded-lg border border-stone-700 px-6 py-3 text-sm font-medium text-stone-300 hover:bg-stone-800 transition-colors">
              Filing guide
            </Link>
          </div>
        </section>

      </main>
      <MarketingFooter />
    </div>
  )
}
