import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { DeadlineBanner } from '@/components/marketing/deadline-banner'

export const revalidate = 3600

export const metadata: Metadata = {
  title: { absolute: 'How to File Your Edinburgh Visitor Levy Return — Step-by-Step Guide | Levy Desk' },
  description:
    'Step-by-step guide to filing your Edinburgh visitor levy return. Covers registration, calculating the levy, applying the 5-night cap and 2% host retention, and submitting the quarterly return.',
  keywords: [
    'Edinburgh visitor levy how to file',
    'Edinburgh visitor levy return',
    'Edinburgh visitor levy quarterly return',
    'Edinburgh visitor levy registration',
    'Edinburgh tourist tax filing',
    'Edinburgh visitor levy deadline',
  ],
  alternates: { canonical: '/edinburgh-visitor-levy/how-to-file' },
  openGraph: {
    title: 'How to File Your Edinburgh Visitor Levy Return',
    description:
      'Step-by-step guide: registration, calculating the levy, applying the 5-night cap and 2% retention, and submitting quarterly.',
    type: 'article',
    locale: 'en_GB',
    siteName: 'Levy Desk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to File Your Edinburgh Visitor Levy Return',
    description: 'Step-by-step filing guide for Edinburgh holiday let owners. 5-night cap, 2% retention, quarterly deadlines.',
  },
}

const STEPS = [
  {
    num: '01',
    title: 'Register as an accommodation provider',
    content: (
      <>
        <p>
          Before you can file a return you must register your property with the City of Edinburgh Council. You only need to do this once — subsequent quarters use the same account.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-stone-600 list-disc list-inside">
          <li>Go to the{' '}
            <a
              href="https://www.edinburgh.gov.uk/visitor-levy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:underline"
            >
              Edinburgh Visitor Levy portal
            </a>
          </li>
          <li>Create an account using your business email address</li>
          <li>Enter each property address and your short-term letting licence number</li>
          <li>You will receive a confirmation email with your operator reference number — keep it safe</li>
        </ul>
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Already registered?</strong> Skip this step and sign in at the portal with your existing credentials.
        </div>
      </>
    ),
  },
  {
    num: '02',
    title: 'Gather your booking records for the quarter',
    content: (
      <>
        <p>
          Collect every booking with a <strong>check-in date</strong> falling within the return quarter. The levy is charged on the booking as a whole if any part of the stay begins on or after 24 July 2026 (the levy start date).
        </p>
        <div className="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Quarter</th>
                <th className="px-4 py-3 text-left font-medium">Check-in dates to include</th>
                <th className="px-4 py-3 text-left font-medium">Return due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3 font-medium text-stone-900">Q3 2026</td>
                <td className="px-4 py-3 text-stone-600">24 Jul – 30 Sep 2026</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">31 Oct 2026</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-stone-900">Q4 2026</td>
                <td className="px-4 py-3 text-stone-600">1 Oct – 31 Dec 2026</td>
                <td className="px-4 py-3 text-stone-500 text-xs">31 Jan 2027</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-stone-900">Q1 2027</td>
                <td className="px-4 py-3 text-stone-600">1 Jan – 31 Mar 2027</td>
                <td className="px-4 py-3 text-stone-500 text-xs">30 Apr 2027</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-stone-500">
          For each booking you need: check-in date, check-out date, total nights, and the gross accommodation income (excluding cleaning fees and damage deposits).
        </p>
        <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          <strong>Pre-commencement exemption:</strong> Bookings that were <em>both made and fully paid before 1 October 2025</em> are fully exempt. Remove these from your return before calculating.
        </div>
      </>
    ),
  },
  {
    num: '03',
    title: 'Calculate the levy for each booking',
    content: (
      <>
        <p>
          Edinburgh charges <strong>5% of gross accommodation income</strong>, but only on the first 5 consecutive nights of each stay. Longer stays are capped.
        </p>
        <div className="mt-4 rounded-xl border border-stone-200 bg-white p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">The formula</p>
          <div className="rounded-lg bg-stone-50 px-4 py-3 font-mono text-sm text-stone-800">
            Levy base = gross income × min(nights, 5) ÷ nights<br />
            Levy = levy base × 5%
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-stone-100 pb-3">
              <div>
                <p className="font-medium text-stone-800">3-night stay, £300 gross</p>
                <p className="text-stone-500">Cap does not apply. £300 × 5% = <strong>£15.00</strong></p>
              </div>
              <span className="text-base font-bold text-stone-900">£15.00</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-3">
              <div>
                <p className="font-medium text-stone-800">5-night stay, £600 gross</p>
                <p className="text-stone-500">Exactly at cap. £600 × 5% = <strong>£30.00</strong></p>
              </div>
              <span className="text-base font-bold text-stone-900">£30.00</span>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="font-medium text-stone-800">7-night stay, £700 gross</p>
                <p className="text-stone-500">Cap applies. Base = £700 × 5/7 = £500. £500 × 5% = <strong>£25.00</strong></p>
              </div>
              <span className="text-base font-bold text-stone-900">£25.00</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-stone-500">
          Repeat this for every bookings in the quarter and sum the individual levy amounts. If your business is VAT-registered, add 20% VAT on top of each levy figure and record both separately.
        </p>
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <strong>Use Levy Desk to automate this:</strong>{' '}
          <Link href="/edinburgh-visitor-levy#calculator" className="underline hover:text-blue-900">
            the calculator
          </Link>{' '}
          applies the cap and VAT rules per booking instantly. Import your Airbnb or Booking.com export and it handles every booking in seconds.
        </div>
      </>
    ),
  },
  {
    num: '04',
    title: 'Apply the 2% host retention',
    content: (
      <>
        <p>
          Edinburgh allows you to keep 2% of the total levy you collected in the quarter as a contribution to your administration costs. Deduct this before calculating what you owe.
        </p>
        <div className="mt-3 rounded-xl border border-stone-200 bg-white p-5 text-sm space-y-2">
          <div className="flex justify-between text-stone-700">
            <span>Total levy collected in quarter</span>
            <span>£500.00</span>
          </div>
          <div className="flex justify-between text-stone-700">
            <span>Host retention (2%)</span>
            <span className="font-medium text-green-700">− £10.00 (you keep this)</span>
          </div>
          <div className="flex justify-between font-semibold text-stone-900 border-t border-stone-100 pt-2">
            <span>Amount to remit to council</span>
            <span>£490.00</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-stone-500">
          The 2% retention does not apply to the VAT element. Remit the full VAT amount separately to HMRC through your normal VAT return.
        </p>
      </>
    ),
  },
  {
    num: '05',
    title: 'Complete the return form on the portal',
    content: (
      <>
        <p>
          Log in to the{' '}
          <a
            href="https://www.edinburgh.gov.uk/visitor-levy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:underline"
          >
            Edinburgh Visitor Levy portal
          </a>{' '}
          and navigate to "File a return." You will need to enter:
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-stone-600 list-disc list-inside">
          <li>The return period (e.g. Q3 2026: 1 Jul – 30 Sep 2026)</li>
          <li>Total number of liable bookings for the quarter</li>
          <li>Total gross accommodation income (liable bookings only)</li>
          <li>Total levy charged (after applying the 5-night cap)</li>
          <li>Host retention amount (2% of levy)</li>
          <li>Net levy to remit (levy minus retention)</li>
          <li>VAT on levy (if VAT-registered)</li>
        </ul>
        <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          <strong>Nil returns:</strong> If you had no liable bookings in the quarter you must still file a nil return. Select "Nil return" on the portal — no payment is required.
        </div>
      </>
    ),
  },
  {
    num: '06',
    title: 'Submit and pay',
    content: (
      <>
        <p>
          Review your figures on the confirmation screen before submitting. Once submitted, the council will issue a payment reference. You can pay by:
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-stone-600 list-disc list-inside">
          <li>Bank transfer (BACS) — use your operator reference number as the payment reference</li>
          <li>Debit or credit card via the portal</li>
        </ul>
        <p className="mt-3 text-sm text-stone-600">
          Payment must reach the council by the deadline — allow 2–3 working days for BACS transfers. Late payment may attract a fixed penalty followed by daily interest.
        </p>
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <strong>Save your confirmation.</strong> Download or screenshot the submission confirmation from the portal. Levy Desk stores a PDF return pack with all your working in case of audit.
        </div>
      </>
    ),
  },
]

const FAQS = [
  {
    q: 'What if I miss the 31 October 2026 deadline for Q3?',
    a: 'File as soon as possible even if you have missed the deadline. Edinburgh City Council can issue a fixed penalty for late filing, followed by interest on unpaid levy. Filing late is always better than not filing at all. Contact the council directly if you have a genuine reason for the delay.',
  },
  {
    q: 'My booking platform (e.g. Airbnb) collects the levy on my behalf. Do I still need to file?',
    a: 'Yes. Even where a platform collects and remits the levy on your behalf, you are still legally required to file a quarterly return with Edinburgh City Council. The return confirms the total levy your platform remitted and accounts for any bookings the platform did not cover (e.g. direct bookings). Mark platform-remitted amounts clearly on the return form.',
  },
  {
    q: 'How do I handle a stay that spans the quarter boundary (e.g. check-in 28 Sep, check-out 3 Oct)?',
    a: "Include the booking in the quarter in which the check-in date falls. A booking that checks in on 28 September 2026 is included in the Q3 2026 return, even though the guest stays into October. Do not split the income across quarters.",
  },
  {
    q: 'A booking was cancelled after I filed — do I need to amend the return?',
    a: "You can amend a submitted return on the Edinburgh portal within a limited window. If the amendment window has passed, the council advises adjusting in the next return. Contact the council helpdesk if a significant refund has already been made and the deadline has passed.",
  },
  {
    q: 'I have multiple properties. Do I file one return or one per property?',
    a: "Edinburgh generally requires one return per operator, covering all your properties. List each property's figures separately within the return form so the council can verify against individual licence numbers. Confirm the latest guidance with the council if you manage properties in different ownership structures.",
  },
]

function BreadcrumbSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Levy Desk', item: 'https://www.levydesk.co.uk' },
      { '@type': 'ListItem', position: 2, name: 'Edinburgh Visitor Levy', item: 'https://www.levydesk.co.uk/edinburgh-visitor-levy' },
      { '@type': 'ListItem', position: 3, name: 'How to file your return', item: 'https://www.levydesk.co.uk/edinburgh-visitor-levy/how-to-file' },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function FaqSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(({ q, a }) => ({
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

export default function HowToFileEdinburghPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf8f2' }}>
      <BreadcrumbSchema />
      <FaqSchema />
      <MarketingNav />
      <DeadlineBanner />

      <main className="mx-auto max-w-3xl px-6 py-12 space-y-12">

        {/* Breadcrumb */}
        <nav className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-700">Levy Desk</Link>
          <span className="mx-2">/</span>
          <Link href="/edinburgh-visitor-levy" className="hover:text-stone-700">Edinburgh Visitor Levy</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">How to file</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              Q3 return due 31 Oct 2026
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Live levy
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
            How to file your Edinburgh<br className="hidden sm:block" /> visitor levy return
          </h1>
          <p className="text-xl text-stone-600 leading-relaxed">
            A step-by-step guide for Edinburgh holiday let hosts filing their quarterly return — including the Q3 2026 return due by <strong>31 October 2026</strong>.
          </p>
        </div>

        {/* Urgency banner */}
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5">
          <p className="text-sm font-semibold text-red-800">Q3 2026 deadline: 31 October 2026</p>
          <p className="mt-1 text-sm text-red-700">
            The first Edinburgh visitor levy quarter ran from 24 July to 30 September 2026. If you had any liable bookings in that period, your return and payment must reach Edinburgh City Council by <strong>31 October 2026</strong>. Follow the steps below.
          </p>
        </div>

        {/* What you need */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">What you'll need before you start</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              'Your Edinburgh short-term letting licence number',
              'A list of all bookings with check-in dates in the quarter',
              'Gross accommodation income per booking (excluding cleaning fees)',
              'Confirmation of any pre-commencement exempt bookings (made and paid before 1 Oct 2025)',
              'Your VAT registration number (if applicable)',
              'Your operator reference number from the Edinburgh portal',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
                <span className="mt-0.5 text-green-500 shrink-0">&#10003;</span>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-stone-900">Step-by-step guide</h2>
          <div className="space-y-4">
            {STEPS.map((step) => (
              <div key={step.num} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                <div className="flex items-center gap-4 border-b border-stone-100 px-6 py-4">
                  <span className="text-2xl font-bold text-orange-200 tabular-nums shrink-0">{step.num}</span>
                  <h3 className="font-semibold text-stone-900">{step.title}</h3>
                </div>
                <div className="px-6 py-5 text-sm text-stone-600 leading-relaxed space-y-3">
                  {step.content}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick reference */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Quick reference — key figures</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Levy rate', value: '5%', note: 'of gross income' },
              { label: 'Night cap', value: '5 nights', note: 'per consecutive stay' },
              { label: 'Host retention', value: '2%', note: 'of total levy' },
              { label: 'VAT on levy', value: '20%', note: 'if VAT-registered only' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-xs text-stone-500">{f.label}</p>
                <p className="mt-1 text-lg font-bold text-stone-900">{f.value}</p>
                <p className="text-xs text-stone-400">{f.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQS.map(({ q, a }) => (
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

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> This guide is based on Levy Desk's interpretation of Edinburgh City Council's published guidance and the Visitor Levy (Scotland) Act 2024. Always verify figures and portal procedures with the{' '}
          <a
            href="https://www.edinburgh.gov.uk/visitor-levy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-900"
          >
            official Edinburgh council guidance
          </a>{' '}
          before filing. Levy Desk does not provide legal or tax advice.
        </div>

        {/* CTA */}
        <section className="rounded-2xl bg-stone-900 px-8 py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Let Levy Desk do the maths</h2>
          <p className="text-stone-400 max-w-lg mx-auto text-sm">
            Import your bookings, apply the correct Edinburgh rules automatically, and download a ready-to-file return pack — including the working for every booking.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/account"
              className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
            >
              Start for free
            </Link>
            <Link
              href="/edinburgh-visitor-levy#calculator"
              className="rounded-lg border border-stone-700 px-6 py-3 text-sm font-medium text-stone-300 hover:bg-stone-800 transition-colors"
            >
              Try the calculator
            </Link>
          </div>
        </section>

      </main>

      <MarketingFooter />
    </div>
  )
}
