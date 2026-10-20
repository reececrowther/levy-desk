import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export const metadata: Metadata = {
  title: { absolute: 'About Levy Desk — Visitor Levy Returns for Holiday Lets' },
  description:
    'Levy Desk is a UK tool built to help holiday let owners and letting agents produce correct, ready-to-file visitor levy returns for councils in Scotland and Wales.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Levy Desk',
    description: 'Built to help holiday let owners and agents file visitor levy returns correctly for Edinburgh, Glasgow, Cardiff, and more.',
    type: 'website',
    locale: 'en_GB',
    siteName: 'Levy Desk',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf8f2' }}>
      <MarketingNav />

      <main className="mx-auto max-w-3xl px-6 py-16 space-y-16">

        {/* Hero */}
        <div className="space-y-4">
          <div className="w-12 h-1 bg-orange-500 rounded" />
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">
            About Levy Desk
          </h1>
          <p className="text-xl text-stone-600 leading-relaxed">
            We built Levy Desk because holiday let hosts in Scotland and Wales were being left to figure out complex new levy rules on their own — often getting them wrong.
          </p>
        </div>

        {/* The problem */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-900">The problem we solve</h2>
          <p className="text-stone-600 leading-relaxed">
            Edinburgh introduced the UK's first visitor levy in July 2026. Glasgow, Aberdeen, Stirling, and Cardiff are following. Each council has its own rate, its own night cap rules, its own exemptions, and its own filing deadlines. For a host with properties across multiple councils, keeping track of all of this in a spreadsheet is error-prone and time-consuming.
          </p>
          <p className="text-stone-600 leading-relaxed">
            The consequences of getting it wrong are real. Filing an incorrect return — whether overclaiming exemptions, miscalculating the levy base, or missing a quarterly deadline — can result in penalties from the council and reputational risk for letting agents who manage properties on behalf of clients.
          </p>
        </section>

        {/* How it works */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-stone-900">How Levy Desk works</h2>
          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'Import your bookings',
                desc: 'Upload a CSV or Excel export from Airbnb, Booking.com, or any other platform. Levy Desk maps the columns to the right fields and imports every booking in seconds.',
              },
              {
                step: '02',
                title: 'We calculate the levy',
                desc: "Our rules engine applies the correct rate, night cap, exemptions, and VAT rules for each council — automatically. Every calculation stores its full working so you can explain any figure to a council auditor or a client.",
              },
              {
                step: '03',
                title: 'You file the return',
                desc: "Levy Desk produces a ready-to-file return pack as a PDF and CSV. You review it, download it, and file it with the council. We never file or pay on your behalf — that stays with you.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 rounded-xl border border-stone-200 bg-white p-5">
                <span className="text-2xl font-bold text-orange-200 tabular-nums shrink-0">{item.step}</span>
                <div>
                  <p className="font-semibold text-stone-800">{item.title}</p>
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Built for accuracy */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-900">Built for accuracy</h2>
          <p className="text-stone-600 leading-relaxed">
            The levy rules are complex, ambiguous in places, and will change over time. Levy Desk handles this by treating rules as versioned data, not hardcoded logic. When Edinburgh updates its rate or a new council comes online, we add a new rule version with an effective date. Calculations locked in a filed quarter never change.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Where the law is genuinely ambiguous — for example, bookings that straddle a levy start date — we surface the uncertainty as an exception flag rather than silently making an assumption. You decide how to handle it.
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>Important:</strong> Levy Desk calculations are based on our interpretation of each council's published guidance. Always verify figures against the council's official documentation before filing. Levy Desk does not provide legal or tax advice.
          </div>
        </section>

        {/* Who we are */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-900">Who we are</h2>
          <p className="text-stone-600 leading-relaxed">
            Levy Desk was founded by <strong className="text-stone-800">Reece</strong>, a UK-based developer who built this tool after seeing holiday let hosts and letting agents struggle with the complexity of the new visitor levy schemes. We are a small, independent product — not affiliated with any council, tourist board, or booking platform.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Our goal is straightforward: make it impossible to file an incorrect return, and make the process fast enough that compliance stops being a burden.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-900">Contact</h2>
          <p className="text-stone-600">
            For general enquiries: <a href="mailto:hello@levydesk.co.uk" className="text-orange-600 hover:underline">hello@levydesk.co.uk</a>
          </p>
          <p className="text-stone-600">
            For privacy and data requests: <a href="mailto:privacy@levydesk.co.uk" className="text-orange-600 hover:underline">privacy@levydesk.co.uk</a>
          </p>
        </section>

        {/* CTA */}
        <div className="flex gap-4">
          <Link
            href="/account"
            className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
          >
            Try Levy Desk free
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            See how it works
          </Link>
        </div>

      </main>

      <MarketingFooter />
    </div>
  )
}
