import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export const metadata: Metadata = {
  title: { absolute: 'How to File Your Glasgow Visitor Levy Return — Step-by-Step Guide | Levy Desk' },
  description:
    'Step-by-step guide to filing your Glasgow visitor levy return. Covers registration, calculating the 5% levy with no night cap, applying 1.5% host retention, and quarterly deadlines from January 2027.',
  keywords: [
    'Glasgow visitor levy how to file',
    'Glasgow visitor levy return',
    'Glasgow visitor levy quarterly return',
    'Glasgow visitor levy registration',
    'Glasgow tourist tax filing',
    'Glasgow visitor levy deadline',
  ],
  alternates: { canonical: '/glasgow-visitor-levy/how-to-file' },
  openGraph: {
    title: 'How to File Your Glasgow Visitor Levy Return',
    description:
      'Step-by-step guide: registration, calculating the 5% levy with no night cap, applying 1.5% retention, and filing quarterly from January 2027.',
    type: 'article',
    locale: 'en_GB',
    siteName: 'Levy Desk',
  },
}

const DEADLINES = [
  { quarter: 'Q1 2027', period: '25 Jan – 31 Mar 2027', due: '30 Apr 2027', status: 'first' },
  { quarter: 'Q2 2027', period: '1 Apr – 30 Jun 2027', due: '31 Jul 2027', status: 'upcoming' },
  { quarter: 'Q3 2027', period: '1 Jul – 30 Sep 2027', due: '31 Oct 2027', status: 'upcoming' },
  { quarter: 'Q4 2027', period: '1 Oct – 31 Dec 2027', due: '31 Jan 2028', status: 'upcoming' },
]

const FAQ = [
  {
    q: 'Is there a pre-commencement exemption for Glasgow like Edinburgh had?',
    a: "Glasgow City Council has not confirmed a pre-commencement booking exemption equivalent to Edinburgh's. Until one is formally announced, treat all bookings with check-in dates on or after 25 January 2027 as liable, regardless of when they were booked.",
  },
  {
    q: 'Do I need to file a nil return for Q1 2027 if I had no Glasgow bookings?',
    a: "Yes. If you are registered as a Glasgow accommodation provider, you must file a nil return for any quarter in which you had no liable bookings. Failing to file a nil return carries the same risk of penalty as missing a return with levy due.",
  },
  {
    q: 'How does Glasgow differ from Edinburgh for calculation purposes?',
    a: "Glasgow has no night cap — every night of a stay is charged at 5% of gross income, regardless of how long the booking is. Edinburgh caps the levy at 5 nights per stay. Glasgow also has a lower host retention of 1.5% (Edinburgh is 2%).",
  },
  {
    q: 'Where do I register for the Glasgow visitor levy?',
    a: "Glasgow uses the same visitorlevy.scot portal as Edinburgh. Registration details and the process for Glasgow operators are expected to be available from Glasgow City Council's website closer to the January 2027 start date.",
  },
  {
    q: 'Does the Glasgow levy apply to bookings made before 25 January 2027?',
    a: "The levy applies to stays that begin on or after 25 January 2027. A booking made in December 2026 for a stay beginning 1 February 2027 is liable. A booking for a stay that ends before 25 January 2027 is not liable, even if it was made recently.",
  },
]

function BreadcrumbSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Levy Desk', item: 'https://www.levydesk.co.uk' },
      { '@type': 'ListItem', position: 2, name: 'Glasgow Visitor Levy', item: 'https://www.levydesk.co.uk/glasgow-visitor-levy' },
      { '@type': 'ListItem', position: 3, name: 'How to file', item: 'https://www.levydesk.co.uk/glasgow-visitor-levy/how-to-file' },
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

export default function HowToFileGlasgowPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf8f2' }}>
      <BreadcrumbSchema />
      <FaqSchema />
      <MarketingNav />

      <main className="mx-auto max-w-3xl px-6 py-12 space-y-12">

        <nav className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-700">Levy Desk</Link>
          <span className="mx-2">/</span>
          <Link href="/glasgow-visitor-levy" className="hover:text-stone-700">Glasgow Visitor Levy</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">How to file</span>
        </nav>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">From 25 Jan 2027</span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">Scotland</span>
            <span className="text-xs text-stone-400">Last reviewed: October 2026</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            How to file your Glasgow visitor levy return
          </h1>
          <p className="text-xl text-stone-600 leading-relaxed">
            Glasgow's levy starts 25 January 2027. The first quarterly return covers 25 Jan – 31 March 2027 and is due 30 April 2027. Here is exactly how to file it.
          </p>
        </div>

        {/* Quick-reference grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Levy rate', value: '5%', note: 'of gross income' },
            { label: 'Night cap', value: 'None', note: 'all nights charged' },
            { label: 'Host retention', value: '1.5%', note: 'of levy collected' },
            { label: 'First deadline', value: '30 Apr 2027', note: 'for Q1 2027' },
          ].map((f) => (
            <div key={f.label} className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="text-xs text-stone-500">{f.label}</p>
              <p className="mt-1 text-base font-bold text-stone-900">{f.value}</p>
              <p className="text-xs text-stone-400">{f.note}</p>
            </div>
          ))}
        </div>

        {/* Key difference from Edinburgh */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-6 py-5 space-y-1">
          <p className="font-semibold text-blue-900">Key difference from Edinburgh</p>
          <p className="text-sm text-blue-800 leading-relaxed">
            Glasgow has <strong>no night cap</strong>. Every night of every stay is charged at 5%, no matter how long the booking is. A 14-night stay is charged on all 14 nights — in Edinburgh it would be capped at 5. Factor this into your pricing before January 2027.
          </p>
        </div>

        {/* Steps */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Step-by-step filing guide</h2>
          <div className="space-y-4">

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">1</span>
                <div className="space-y-2">
                  <h3 className="font-semibold text-stone-900">Register with Glasgow City Council</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Registration for the Glasgow levy is expected to open via{' '}
                    <a href="https://www.visitorlevy.scot" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                      visitorlevy.scot
                    </a>{' '}
                    ahead of the January 2027 start date. Monitor{' '}
                    <a href="https://www.glasgow.gov.uk/visitorlevy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                      glasgow.gov.uk/visitorlevy
                    </a>{' '}
                    for the formal registration process. You will need your short-term letting licence number and the address of each Glasgow property.
                  </p>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Do not wait until January to register. Registration codes are being issued from October 2026. Register early to avoid delays on your first return.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">2</span>
                <div className="space-y-2">
                  <h3 className="font-semibold text-stone-900">Gather your booking records for the quarter</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Collect all bookings with a check-in date on or after 25 January 2027. For the first return (Q1 2027), this means bookings with check-in dates between 25 January and 31 March 2027. For each booking you need:
                  </p>
                  <ul className="text-sm text-stone-600 list-disc list-inside space-y-1 mt-2">
                    <li>Guest-paid accommodation price (gross, before any platform commission)</li>
                    <li>Check-in and check-out dates</li>
                    <li>Number of nights</li>
                    <li>Whether the booking was made before or after 25 January 2027</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">3</span>
                <div className="space-y-2">
                  <h3 className="font-semibold text-stone-900">Calculate the levy for each booking</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    For each liable booking: <strong>gross accommodation price × 5%</strong>. There is no night cap in Glasgow, so the full stay is always charged.
                  </p>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm space-y-2">
                    <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">Worked examples</p>
                    <div className="flex justify-between text-stone-700"><span>3-night stay, £300 gross</span><span className="font-medium">£300 × 5% = £15.00</span></div>
                    <div className="flex justify-between text-stone-700"><span>7-night stay, £700 gross</span><span className="font-medium">£700 × 5% = £35.00</span></div>
                    <div className="flex justify-between text-stone-700"><span>14-night stay, £1,400 gross</span><span className="font-medium">£1,400 × 5% = £70.00</span></div>
                  </div>
                  <p className="text-xs text-stone-500">
                    Compare to Edinburgh: a 14-night stay capped at 5 nights would give £500 × 5% = £25.00. Glasgow charges the full £70.00.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">4</span>
                <div className="space-y-2">
                  <h3 className="font-semibold text-stone-900">Apply the 1.5% host retention</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Sum the levy across all bookings in the quarter. You may retain <strong>1.5%</strong> of the total as an administration contribution before remitting the balance.
                  </p>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm space-y-2">
                    <div className="flex justify-between text-stone-700"><span>Total levy collected</span><span>£350.00</span></div>
                    <div className="flex justify-between text-green-700"><span>Host retention (1.5%)</span><span>keep £5.25</span></div>
                    <div className="flex justify-between font-semibold text-stone-900 border-t border-stone-200 pt-2"><span>Amount to remit to council</span><span>£344.75</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">5</span>
                <div className="space-y-2">
                  <h3 className="font-semibold text-stone-900">Submit the return and pay by the deadline</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Log in to{' '}
                    <a href="https://www.visitorlevy.scot" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                      visitorlevy.scot
                    </a>
                    , enter your quarterly totals, and pay the net levy. Keep a copy of your submission confirmation and payment receipt for your records.
                  </p>
                  <p className="text-sm text-stone-600">
                    File even if you had no bookings in the quarter — a nil return is still required.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Filing deadlines */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Glasgow filing deadlines</h2>
          <div className="overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Quarter</th>
                  <th className="px-4 py-3 text-left font-medium">Period</th>
                  <th className="px-4 py-3 text-left font-medium">Due date</th>
                  <th className="px-4 py-3 text-left font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {DEADLINES.map((row) => (
                  <tr key={row.quarter}>
                    <td className="px-4 py-3 font-medium text-stone-900">{row.quarter}</td>
                    <td className="px-4 py-3 text-stone-600">{row.period}</td>
                    <td className="px-4 py-3 font-semibold text-stone-800">{row.due}</td>
                    <td className="px-4 py-3">
                      {row.status === 'first' && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">First return</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Preparation checklist */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">What to do before January 2027</h2>
          <div className="rounded-xl border border-stone-200 bg-white divide-y divide-stone-100">
            {[
              'Register with Glasgow City Council as soon as registration opens',
              'Ensure your booking records capture gross guest-paid price (not your net payout)',
              'Update your Airbnb listing price to account for the 5% levy with no night cap',
              'Brief your property manager or accountant on the January start date',
              'Set a reminder for 30 April 2027 — the first return deadline',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <span className="mt-0.5 shrink-0 text-xs font-bold text-orange-500">✓</span>
                <p className="text-sm text-stone-700">{item}</p>
              </div>
            ))}
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
          <strong>Disclaimer:</strong> This guide is based on Levy Desk's interpretation of Glasgow City Council's published scheme guidance as of October 2026. Some details may change before the January 2027 start date. Always verify with{' '}
          <a href="https://www.glasgow.gov.uk/visitorlevy" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">
            Glasgow City Council's official guidance
          </a>.
        </div>

        <section className="rounded-2xl bg-stone-900 px-8 py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Get ready for Glasgow's levy</h2>
          <p className="text-stone-400 max-w-lg mx-auto text-sm">
            Import your bookings now. Levy Desk applies the Glasgow rules — no night cap, 1.5% retention — automatically and queues your quarterly return for filing.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/account" className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors">
              Start for free
            </Link>
            <Link href="/glasgow-visitor-levy" className="rounded-lg border border-stone-700 px-6 py-3 text-sm font-medium text-stone-300 hover:bg-stone-800 transition-colors">
              Glasgow rates and rules
            </Link>
          </div>
        </section>

      </main>
      <MarketingFooter />
    </div>
  )
}
