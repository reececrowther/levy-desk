import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { LevyCalculator } from '@/components/marketing/levy-calculator'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

// ─── SEO ──────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    absolute: 'Visitor Levy Calculator — Scotland & Wales | Levy Desk',
  },
  description:
    'Free visitor levy calculator for holiday let owners in Scotland and Wales. Correct rates, night caps and exemptions for Edinburgh, Glasgow, Cardiff and more.',
  keywords: [
    'visitor levy calculator',
    'Edinburgh visitor levy',
    'Edinburgh tourist tax calculator',
    'Scotland visitor levy',
    'Welsh visitor accommodation levy',
    'Cardiff visitor levy',
    'holiday let levy return',
    'tourist tax Scotland 2026',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Visitor Levy Calculator — Scotland & Wales',
    description:
      'Correct rates, night caps and exemptions applied automatically. Free to use for Edinburgh, Glasgow, Cardiff and more.',
    type: 'website',
    locale: 'en_GB',
    url: '/',
    siteName: 'Levy Desk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visitor Levy Calculator — Scotland & Wales',
    description:
      'Correct rates, night caps and exemptions applied automatically. Free to use for Edinburgh, Glasgow, Cardiff and more.',
  },
}

const FAQ_ITEMS = [
  {
    q: "Does Edinburgh's levy apply to all my bookings?",
    a: "No. Bookings that were both made and fully paid before 1 October 2025 are exempt, regardless of the stay date. Levy Desk applies this rule automatically to every booking you import.",
  },
  {
    q: "I list on Airbnb. Do I still need to file a return?",
    a: "Yes. Even where Airbnb collects and remits the levy on your behalf, you are legally required to file a return — including a nil return for quarters with no bookings. Levy Desk flags Booking.com and Airbnb bookings separately and can generate nil returns in one click.",
  },
  {
    q: "What is the Edinburgh 5-night cap?",
    a: "Edinburgh charges the levy on a maximum of 5 consecutive nights per stay, regardless of how long the booking is. A 10-night stay is charged as 5 nights. Levy Desk applies the cap and shows the full working so you can explain it to a guest or council auditor.",
  },
  {
    q: "How does Cardiff's levy work?",
    a: "Cardiff's Welsh Visitor Accommodation Levy is charged per person per night: £1.30 for most accommodation types, or £0.75 per adult for hostels and campsites. Under-18s are charged nothing. Stays of 32 nights or more are exempt entirely.",
  },
  {
    q: "Do I owe VAT on the levy?",
    a: "Only if your business is VAT-registered. If it is, you charge 20% VAT on the levy amount itself and remit both to the council. Levy Desk calculates and breaks this out separately in the return pack.",
  },
  {
    q: "When are Edinburgh returns due?",
    a: "Edinburgh uses quarterly calendar returns. Q3 2026 (1 July – 30 September) was due by 31 October 2026. Q4 2026 (1 October – 31 December) is due by 31 January 2027. Levy Desk shows the next deadline on your dashboard and sends reminders.",
  },
  {
    q: "How does Glasgow's visitor levy work?",
    a: "Glasgow's visitor levy is 5% of gross accommodation income, the same rate as Edinburgh. The key difference is that Glasgow has no night cap — every night of a stay is charged, unlike Edinburgh which stops at 5 nights. Glasgow also has no host retention allowance.",
  },
  {
    q: "When does Glasgow's levy start?",
    a: "Glasgow's visitor levy is confirmed to start from 1 January 2027. Quarterly returns follow the same calendar pattern as Edinburgh. Levy Desk will calculate Glasgow levies automatically for any booking from that date.",
  },
]

const COUNCIL_TABLE = [
  { name: 'Edinburgh',           country: 'Scotland', rate: '5% of gross',       cap: '5 nights',  liveFrom: '24 Jul 2026', status: 'Live',      verified: true,  href: '/edinburgh-visitor-levy' },
  { name: 'Glasgow',             country: 'Scotland', rate: '5% of gross',       cap: 'None',      liveFrom: '25 Jan 2027', status: 'Confirmed', verified: false, href: '/glasgow-visitor-levy' },
  { name: 'Aberdeen',            country: 'Scotland', rate: '7% of gross',       cap: 'None',      liveFrom: '1 Apr 2027',  status: 'Confirmed', verified: false, href: null },
  { name: 'Stirling',            country: 'Scotland', rate: '3% of gross',       cap: '7 nights',  liveFrom: '14 Jun 2027', status: 'Confirmed', verified: false, href: null },
  { name: 'West Dunbartonshire', country: 'Scotland', rate: '5% of gross',       cap: 'None',      liveFrom: '1 Jul 2027',  status: 'Confirmed', verified: false, href: null },
  { name: 'Cardiff',             country: 'Wales',    rate: '£1.30/person/night', cap: '31 nights', liveFrom: '1 Apr 2027',  status: 'Confirmed', verified: false, href: '/cardiff-tourism-levy' },
]

// ─── JSON-LD schemas ──────────────────────────────────────────────────────────

function FaqSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
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

function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Levy Desk',
    url: 'https://www.levydesk.co.uk',
    logo: 'https://www.levydesk.co.uk/icon.png',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@levydesk.co.uk',
      contactType: 'customer support',
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Levy Desk',
    url: 'https://www.levydesk.co.uk',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Visitor levy return software for holiday let owners and letting agents in Scotland and Wales. Calculates Edinburgh, Glasgow, and Cardiff levies and produces ready-to-file quarterly return packs.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'GBP',
        description: '1 property, manual booking entry, full levy calculation, CSV export',
      },
      {
        '@type': 'Offer',
        name: 'Owner',
        price: '8',
        priceCurrency: 'GBP',
        description: 'Unlimited properties, CSV/Excel import, Airbnb and Booking.com presets, PDF return packs',
      },
      {
        '@type': 'Offer',
        name: 'Agent',
        price: '99',
        priceCurrency: 'GBP',
        description: 'Multiple clients, per-client return packs, owner statements, accountant read-only access',
      },
      {
        '@type': 'Offer',
        name: 'B&B / Hotel',
        price: '25',
        priceCurrency: 'GBP',
        description: 'Up to 10 rooms, room-level breakdown, PDF return packs, deadline reminders',
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Levy Desk',
    url: 'https://www.levydesk.co.uk',
    description: 'Visitor levy return software for holiday let owners and letting agents in Scotland and Wales.',
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const session = await auth()
  if (session?.user?.id) redirect('/dashboard')

  return (
    <div className="min-h-screen" style={{ background: '#fdf8f2' }}>
      <FaqSchema />
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <WebSiteSchema />

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#fdf8f2]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-bold tracking-tight text-stone-900">Levy Desk</span>
          <nav className="hidden items-center gap-6 text-sm text-stone-600 sm:flex">
            <a href="#calculator" className="hover:text-stone-900">Calculator</a>
            <a href="#how-it-works" className="hover:text-stone-900">How it works</a>
            <a href="#councils" className="hover:text-stone-900">Councils</a>
            <a href="#pricing" className="hover:text-stone-900">Pricing</a>
            <Link href="/visitor-levy-tracker" className="hover:text-stone-900">Tracker</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-stone-600 hover:text-stone-900"
            >
              Sign in
            </Link>
            <Link
              href="/account"
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
            >
              Try free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Edinburgh levy live from 24 July 2026
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 lg:text-5xl">
            Visitor levy returns,{' '}
            <span className="text-orange-600">done right.</span>
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed">
            Scotland and Wales&apos;s tourist tax works differently in every council — different
            rates, night caps, cut-off dates, and exemptions. Stop calculating it by hand.
            Import your bookings and get a correct, ready-to-file return pack.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#calculator"
              className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
            >
              Try the calculator
            </a>
            <Link
              href="/account"
              className="rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Sign up free
            </Link>
          </div>
          <p className="text-xs text-stone-400">
            No card required · Free for one property · Scotland and Wales
          </p>
        </div>

        {/* Return pack preview */}
        <div className="mt-12 lg:mt-0">
          <div className="rounded-xl bg-stone-900 p-6 text-sm font-mono text-stone-300 shadow-xl ring-1 ring-stone-800">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-stone-500">
                Return pack preview
              </span>
              <span className="rounded-full bg-green-900/50 px-2 py-0.5 text-[10px] font-sans text-green-400">
                Ready to file
              </span>
            </div>
            <p className="text-base font-sans font-semibold text-white mb-0.5">
              Edinburgh Visitor Levy
            </p>
            <p className="text-stone-400 text-xs font-sans mb-5">
              Q4 2026 · 1 Oct – 31 Dec 2026
            </p>
            <div className="space-y-2 border-t border-stone-700 pt-4 text-xs">
              <PreviewRow label="Properties" value="2" />
              <PreviewRow label="Bookings charged" value="14" />
              <PreviewRow label="Total levy (5%)" value="£1,247.50" />
              <PreviewRow label="Host retention (2%)" value="−£24.95" muted />
              <div className="border-t border-stone-700 pt-2">
                <PreviewRow label="Net payable to council" value="£1,222.55" highlight />
              </div>
            </div>
            <div className="mt-5 flex gap-2 font-sans">
              <span className="rounded border border-stone-700 px-3 py-1.5 text-[11px] text-stone-400 hover:border-stone-500 cursor-default">
                Download CSV
              </span>
              <span className="rounded border border-stone-700 px-3 py-1.5 text-[11px] text-stone-400 hover:border-stone-500 cursor-default">
                Download PDF
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Calculator ───────────────────────────────────────────────────────── */}
      <section
        id="calculator"
        className="border-t border-stone-200"
        style={{ background: '#fff7ed' }}
      >
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900">
              Try the calculator
            </h2>
            <p className="mt-2 text-stone-500">
              No sign-up required. Select a council, enter the stay dates and amount, and get
              the correct levy breakdown — including any night cap, cut-off exemption, and VAT.
            </p>
          </div>
          <LevyCalculator />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900 mb-10">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Step
              number="1"
              title="Import your bookings"
              body="Upload a CSV or Excel export from Airbnb, Booking.com, or VRBO. Column mapping is saved for next time, so subsequent imports take seconds."
            />
            <Step
              number="2"
              title="Rules applied automatically"
              body="The correct rate, night cap, booking cut-off, deductions, and VAT are applied to every booking for your council and date range. Every decision is explained step by step."
            />
            <Step
              number="3"
              title="Download your return pack"
              body="A CSV and PDF laid out to match your council's return form. Ready to sign and submit. Locked once filed; amendments are tracked in the audit log."
            />
          </div>
        </div>
      </section>

      {/* ── Why it matters ───────────────────────────────────────────────────── */}
      <section className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">
            Why a spreadsheet gets it wrong
          </h2>
          <p className="text-stone-500 mb-10 max-w-xl">
            The visitor levy is new, and the rules are more detailed than most guides explain.
            These are the four places where manual calculations tend to fail.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ProblemCard
              title="The 5-night cap"
              body="Edinburgh charges the levy on a maximum of 5 consecutive nights. A 7-night stay is charged as 5 nights. Most spreadsheets miss this and overcharge guests — creating a refund liability."
            />
            <ProblemCard
              title="The booking cut-off"
              body="Bookings made and fully paid before 1 October 2025 are exempt from Edinburgh's levy, regardless of the stay date. Without tracking payment dates, you may file the wrong figures."
            />
            <ProblemCard
              title="Platform remittance"
              body="Booking.com remits Edinburgh's levy directly to the council. If you also include those bookings in your return, you double-pay. Levy Desk flags every Booking.com booking and prompts you to confirm."
            />
            <ProblemCard
              title="VAT on the levy"
              body="VAT-registered hosts must charge 20% VAT on the levy itself — not on the accommodation price. This is a separate line on the return. Edinburgh also allows a 2% host retention on top."
            />
          </div>
        </div>
      </section>

      {/* ── Council coverage ─────────────────────────────────────────────────── */}
      <section id="councils" className="border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            Council coverage
          </h2>
          <p className="text-stone-500 mb-8">
            Levy Desk covers every council that has confirmed or live visitor levy legislation.
            Start dates marked with an asterisk (*) are unverified pending official confirmation.
          </p>
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                  <th className="px-5 py-3">Council</th>
                  <th className="px-5 py-3">Country</th>
                  <th className="px-5 py-3">Levy rate</th>
                  <th className="px-5 py-3">Night cap</th>
                  <th className="px-5 py-3">Live from</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {COUNCIL_TABLE.map((row) => (
                  <tr key={row.name} className="hover:bg-stone-50">
                    <td className="px-5 py-3 font-medium text-stone-900">
                      {row.href ? (
                        <Link href={row.href} className="text-orange-700 hover:underline">{row.name}</Link>
                      ) : (
                        row.name
                      )}
                    </td>
                    <td className="px-5 py-3 text-stone-500">{row.country}</td>
                    <td className="px-5 py-3 font-mono text-stone-700">{row.rate}</td>
                    <td className="px-5 py-3 text-stone-500">{row.cap}</td>
                    <td className="px-5 py-3 text-stone-500">{row.liveFrom}{!row.verified ? '*' : ''}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          row.status === 'Live'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-stone-400">
              * Exact start date unverified. Levy Desk uses a conservative default and flags
              affected bookings for host confirmation.
            </p>
            <Link href="/visitor-levy-tracker" className="text-xs font-medium text-orange-600 hover:underline shrink-0 ml-4">
              Full tracker including councils considering a levy →
            </Link>
          </div>
        </div>
      </section>

      {/* ── For letting agents ───────────────────────────────────────────────── */}
      <section className="border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600">
                For letting agents
              </div>
              <h2 className="text-2xl font-bold text-stone-900">
                Manage levy returns for all your clients in one place
              </h2>
              <p className="text-stone-600 leading-relaxed">
                Letting agents managing properties across Edinburgh, Glasgow, and Cardiff face a complex patchwork of rules. Levy Desk gives you a single workspace per client, with separate return packs, per-property breakdowns, and read-only access for client accountants.
              </p>
              <ul className="space-y-2 text-sm text-stone-600">
                {[
                  'One workspace per client — data stays separated',
                  'Per-client return packs in PDF and CSV',
                  'Owner statements showing levy collected and remitted',
                  'Accountant read-only access at no extra cost',
                  'Priced at £5/property/month (£99/month minimum)',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-xs font-bold text-orange-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <Link
                  href="/account"
                  className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
                >
                  Start free trial
                </Link>
                <a
                  href="mailto:hello@levydesk.co.uk"
                  className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Ask a question
                </a>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 space-y-3">
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">Agent — worked example</p>
                <div className="space-y-2 text-sm text-stone-600">
                  <div className="flex justify-between"><span>Properties under management</span><span className="font-medium text-stone-800">24</span></div>
                  <div className="flex justify-between"><span>Monthly cost</span><span className="font-medium text-stone-800">£120/month</span></div>
                  <div className="flex justify-between border-t border-stone-100 pt-2"><span>Per-property cost</span><span className="font-medium text-stone-800">£5/property</span></div>
                </div>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                <strong className="text-stone-800">Client data stays separate.</strong> Each client has their own workspace, return history, and export. You can switch between clients without mixing data.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Pricing</h2>
          <p className="text-stone-500 mb-10">
            Start free. Upgrade when you need more properties or clients.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <PricingCard
              plan="Free"
              price="£0"
              per="forever"
              features={[
                '1 property',
                'Manual booking entry',
                'Full levy calculation',
                'CSV export',
              ]}
              cta="Start free"
              href="/account"
            />
            <PricingCard
              plan="Owner"
              price="£8"
              per="unit / month"
              features={[
                'Unlimited properties',
                'CSV and Excel import',
                'Airbnb and Booking.com presets',
                'Exceptions queue',
                'PDF return packs',
              ]}
              cta="Start free trial"
              href="/account"
              highlight
            />
            <PricingCard
              plan="Agent"
              price="from £99"
              per="/ month"
              features={[
                'Multiple clients',
                'Per-client return packs',
                'Owner statements',
                'Accountant read-only access',
                '£5/unit/month',
              ]}
              cta="Start free trial"
              href="/account"
            />
            <PricingCard
              plan="B&B / Hotel"
              price="£25"
              per="property / month"
              features={[
                'Up to 10 rooms',
                'Room-level breakdown',
                'PDF return packs',
                'Deadline reminders',
              ]}
              cta="Start free trial"
              href="/account"
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="border-t border-stone-200">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900 mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-stone-200 bg-white px-5"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 text-sm font-medium text-stone-800 marker:content-[''] list-none">
                  <span>{q}</span>
                  <span className="shrink-0 text-stone-400 group-open:rotate-45 transition-transform text-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="pb-4 text-sm text-stone-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="border-t border-stone-200 bg-stone-900">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start for free — no card required
          </h2>
          <p className="text-stone-400 mb-8 leading-relaxed">
            Add one property, import your bookings, and see your visitor levy calculated
            correctly. Upgrade when you&apos;re ready to file.
          </p>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-8 py-3.5 text-sm font-medium text-white hover:bg-orange-500 transition-colors"
          >
            Create your free account
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <MarketingFooter />
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PreviewRow({
  label,
  value,
  muted,
  highlight,
}: {
  label: string
  value: string
  muted?: boolean
  highlight?: boolean
}) {
  return (
    <div
      className={`flex justify-between ${muted ? 'text-stone-500' : ''} ${highlight ? 'font-semibold text-white' : ''}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function Step({
  number,
  title,
  body,
}: {
  number: string
  title: string
  body: string
}) {
  return (
    <div className="space-y-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
        {number}
      </div>
      <h3 className="font-semibold text-stone-900">{title}</h3>
      <p className="text-sm text-stone-500 leading-relaxed">{body}</p>
    </div>
  )
}

function ProblemCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-2">
      <h3 className="font-semibold text-stone-900">{title}</h3>
      <p className="text-sm text-stone-500 leading-relaxed">{body}</p>
    </div>
  )
}

function PricingCard({
  plan,
  price,
  per,
  features,
  cta,
  href,
  highlight,
}: {
  plan: string
  price: string
  per: string
  features: string[]
  cta: string
  href: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl p-6 space-y-5 ${
        highlight
          ? 'bg-orange-600 text-white ring-2 ring-orange-600'
          : 'bg-white border border-stone-200'
      }`}
    >
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${highlight ? 'text-orange-100' : 'text-stone-400'}`}>
          {plan}
        </p>
        <p className={`text-3xl font-bold tracking-tight ${highlight ? 'text-white' : 'text-stone-900'}`}>
          {price}
        </p>
        <p className={`text-xs mt-0.5 ${highlight ? 'text-orange-200' : 'text-stone-400'}`}>
          {per}
        </p>
      </div>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className={`flex items-start gap-2 text-sm ${highlight ? 'text-orange-50' : 'text-stone-600'}`}>
            <span className={`mt-0.5 shrink-0 text-xs font-bold ${highlight ? 'text-orange-200' : 'text-orange-500'}`}>
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
          highlight
            ? 'bg-white text-orange-600 hover:bg-orange-50'
            : 'bg-stone-900 text-white hover:bg-stone-700'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}
