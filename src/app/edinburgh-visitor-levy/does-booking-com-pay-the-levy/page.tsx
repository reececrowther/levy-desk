import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { LevyCalculator } from '@/components/marketing/levy-calculator'
import { DeadlineBanner } from '@/components/marketing/deadline-banner'

export const revalidate = 3600

const PATH = '/edinburgh-visitor-levy/does-booking-com-pay-the-levy'
const GUIDANCE_URL =
  'https://www.edinburgh.gov.uk/downloads/file/40692/edinburgh-visitor-levy-scheme-information-for-accommodation-providers'

export const metadata: Metadata = {
  title: { absolute: 'Does Booking.com or Airbnb Pay the Edinburgh Visitor Levy for You? | Levy Desk' },
  description:
    "No. Even if Booking.com or Airbnb collects the levy from your guest, you are the liable person and must file the return and pay Edinburgh council yourself. What the council's guidance says, with an example.",
  keywords: [
    'does booking.com pay the visitor levy',
    'does airbnb pay the edinburgh visitor levy',
    'booking.com edinburgh visitor levy',
    'airbnb edinburgh visitor levy',
    'who pays the edinburgh visitor levy',
    'visitor levy platform bookings',
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Does Booking.com or Airbnb Pay the Edinburgh Visitor Levy for You?',
    description:
      'No. You remain the liable person and must file and pay the council yourself, even if the platform collected the levy from the guest.',
    type: 'article',
    locale: 'en_GB',
    siteName: 'Levy Desk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Does Booking.com or Airbnb Pay the Edinburgh Visitor Levy?',
    description: 'No. You are the liable person and must file and pay the council yourself.',
  },
}

const FAQ = [
  {
    q: 'Booking.com showed the guest a city tax. Does that mean it has been paid?',
    a: "No. If Booking.com collects the levy from the guest, it passes that money to you. It does not pay the council. You still include the booking in your return on visitorlevy.scot and pay the council by the payment deadline.",
  },
  {
    q: 'Can Airbnb or Booking.com register and pay the levy on my behalf?',
    a: "Not under Edinburgh's scheme. The council's guidance (version 2.1, September 2026) says the accommodation provider remains the liable person, and there is no arrangement for a booking platform to pay the council directly for you.",
  },
  {
    q: 'Is the levy worked out on the guest price or on my payout?',
    a: 'On the price the guest paid for the accommodation, not on what the platform pays out to you after its commission. Exclude VAT if you are VAT-registered, and exclude genuinely optional extras such as parking or meals.',
  },
  {
    q: 'Do I need to show Booking.com and Airbnb bookings separately on the return?',
    a: 'The return asks for monthly accommodation revenue, not a split by platform. Add up all liable bookings, whichever platform or channel they came through, including direct bookings.',
  },
  {
    q: 'What if I forgot to add the levy to my prices?',
    a: "The levy is still due on liable stays, so you pay it out of your own income for those bookings. Add it to your prices for future bookings so guests pay it.",
  },
]

function BreadcrumbSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Levy Desk', item: 'https://www.levydesk.co.uk' },
      { '@type': 'ListItem', position: 2, name: 'Edinburgh Visitor Levy', item: 'https://www.levydesk.co.uk/edinburgh-visitor-levy' },
      { '@type': 'ListItem', position: 3, name: 'Does Booking.com pay the levy?', item: `https://www.levydesk.co.uk${PATH}` },
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

export default function DoesBookingComPayPage() {
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
          <span className="text-stone-800">Does Booking.com pay the levy?</span>
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
            Does Booking.com or Airbnb pay the Edinburgh visitor levy for you?
          </h1>
          <p className="text-xl text-stone-600 leading-relaxed">
            No. Even when a platform collects the levy from your guest, you are the one who must include the booking in
            your return and pay City of Edinburgh Council.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 space-y-1">
          <p className="font-semibold text-red-800">The short answer</p>
          <p className="text-sm text-red-700">
            The council&apos;s guidance says the accommodation provider remains the liable person for every booking,
            including bookings through Booking.com, Airbnb and other platforms. Any levy a platform collects is passed
            on to you, and you pay the council.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">What the council&apos;s guidance says</h2>
          <ul className="space-y-3 text-stone-600 leading-relaxed list-disc pl-5">
            <li>
              <strong>You are the liable person.</strong> Whoever provides the accommodation is responsible for the levy,
              whichever website the guest booked through (guidance pages 6 to 7).
            </li>
            <li>
              <strong>Platforms don&apos;t pay the council for you.</strong> There is no arrangement for a booking platform
              to pay the levy to the council directly. If a platform collects it from the guest, the money is passed to
              you, and you pay it.
            </li>
            <li>
              <strong>It&apos;s worked out on the guest&apos;s price, not your payout.</strong> Commission charged to the
              guest counts. Commission you pay the platform out of the price doesn&apos;t reduce the levy (pages 5 to 7).
            </li>
            <li>
              <strong>Every channel goes in the same return.</strong> Booking.com, Airbnb, Vrbo and direct bookings are
              all added together on visitorlevy.scot.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Example: a Booking.com stay</h2>
          <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-700 space-y-2">
            <p>A guest books 3 nights through Booking.com and pays <strong>£450</strong> for the accommodation.</p>
            <p>Booking.com keeps 15% commission (£67.50) and pays you £382.50.</p>
            <div className="border-t border-stone-100 pt-3 space-y-1">
              <div className="flex justify-between"><span>Levy base: what the guest paid</span><span className="font-medium">£450.00</span></div>
              <div className="flex justify-between"><span>Levy at 5%</span><span className="font-medium">£22.50</span></div>
              <div className="flex justify-between text-green-700"><span>You keep 2% of the levy</span><span>£0.45</span></div>
              <div className="flex justify-between font-semibold"><span>You pay the council</span><span>£22.05</span></div>
            </div>
            <p className="text-xs text-stone-500 pt-1">
              Working the levy out on your £382.50 payout would give £19.13, which underpays by £3.37 on this one booking.
            </p>
          </div>
        </section>

        <section className="space-y-4" id="calculator">
          <h2 className="text-lg font-semibold text-stone-900">Check a booking</h2>
          <p className="text-sm text-stone-500">Enter what the guest paid. The 5-night cap and 2% retention are applied for you.</p>
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
          <Link href="/edinburgh-visitor-levy/cleaning-fees" className="text-orange-700 underline">Is the cleaning fee included?</Link>
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
          <h2 className="text-2xl font-bold text-white">Booking.com and Airbnb in one return</h2>
          <p className="text-stone-400 max-w-lg mx-auto text-sm">
            Upload your Booking.com and Airbnb exports. Levy Desk works out the levy on every booking, with the working
            shown, and gives you the quarter&apos;s return figures.
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
