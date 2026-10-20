import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export const metadata: Metadata = {
  title: { absolute: 'Terms of Service | Levy Desk' },
  description: 'Terms and conditions for using Levy Desk. Covers subscriptions, acceptable use, liability, and governing law.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '20 October 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf8f2' }}>
      <MarketingNav />

      <main className="mx-auto max-w-3xl px-6 py-16 space-y-10">

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Terms of Service</h1>
          <p className="text-sm text-stone-500">Last updated: {LAST_UPDATED}</p>
          <p className="text-stone-600 leading-relaxed">
            These terms govern your use of Levy Desk at levydesk.co.uk. By creating an account or using the service, you agree to these terms. Please read them carefully.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2">
          <p className="font-semibold text-amber-900 text-sm">Important — what Levy Desk does not do</p>
          <p className="text-sm text-amber-800 leading-relaxed">
            Levy Desk calculates visitor levies and produces return packs for you to review and file yourself. We do <strong>not</strong> file returns with councils on your behalf, make payments to councils on your behalf, or provide legal or tax advice. You are responsible for the accuracy of data you input, for verifying calculations against each council's official guidance, and for submitting returns and payments on time.
          </p>
        </div>

        <Section title="1. The service">
          <p>
            Levy Desk is a trading name operated as a sole trader in the United Kingdom. References to "we", "us", or "Levy Desk" mean that operator.
          </p>
          <p>
            The service helps holiday let owners and letting agents calculate visitor levies and produce quarterly return packs for councils in Scotland and Wales. It is a software tool, not a filing agent, accountant, or legal adviser.
          </p>
        </Section>

        <Section title="2. Accounts">
          <p>
            You must create an account to use Levy Desk. You are responsible for keeping your sign-in credentials secure and for all activity under your account.
          </p>
          <p>
            You must be at least 18 years old and have the legal authority to enter into these terms on behalf of any business you register. By creating a workspace, you confirm this.
          </p>
          <p>
            We may suspend or close accounts that breach these terms, without notice in cases of serious or repeated breach.
          </p>
        </Section>

        <Section title="3. Plans and payments">
          <p>
            Levy Desk offers a free plan and paid subscription plans (Owner, Agent, B&B). Paid plan features and limits are described on the pricing page at levydesk.co.uk.
          </p>
          <p>
            Paid subscriptions are billed monthly in advance via Stripe. By subscribing, you authorise us to charge your payment method on a recurring monthly basis until you cancel.
          </p>
          <p>
            Prices are shown in GBP and are inclusive of VAT where applicable. We reserve the right to change prices on 30 days' notice. Continued use after the notice period constitutes acceptance.
          </p>
        </Section>

        <Section title="4. Cancellation and refunds">
          <p>
            You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period; you retain access to paid features until then.
          </p>
          <p>
            If you cancel within 14 days of your first payment on a new subscription and have not used the service to generate a filed return, you may request a full refund by emailing <a href="mailto:hello@levydesk.co.uk" className="text-orange-600 hover:underline">hello@levydesk.co.uk</a>. Outside this window, payments are non-refundable except where required by law.
          </p>
          <p>
            Downgrading your plan does not entitle you to a partial refund of the current billing period.
          </p>
        </Section>

        <Section title="5. Accuracy and your responsibilities">
          <p>
            Levy calculations are based on our interpretation of each council's published guidance at the time the rule was configured. Levy Desk does not guarantee that calculations are free from error or that they reflect the most recent guidance.
          </p>
          <p>You are responsible for:</p>
          <ul className="space-y-2 text-stone-600">
            <Li>Entering accurate booking data (dates, guest counts, gross income)</Li>
            <Li>Verifying calculated levy amounts against the relevant council's official guidance before filing</Li>
            <Li>Filing returns and remitting levy payments to councils on time</Li>
            <Li>Maintaining your own records in accordance with HMRC requirements</Li>
          </ul>
          <p>
            We flag bookings that have uncertain or ambiguous levy treatment as exceptions. You must review and resolve these before including them in a filed return.
          </p>
        </Section>

        <Section title="6. Acceptable use">
          <p>You must not:</p>
          <ul className="space-y-2 text-stone-600">
            <Li>Use the service to process data for properties you do not own or manage</Li>
            <Li>Attempt to access another user's account or data</Li>
            <Li>Reverse engineer, copy, or resell the service</Li>
            <Li>Use the service in any way that violates applicable law</Li>
            <Li>Upload data containing malicious code</Li>
          </ul>
        </Section>

        <Section title="7. Your data">
          <p>
            You retain ownership of all booking, property, and return data you upload to Levy Desk. We process it on your behalf to provide the service, as described in our <a href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</a>.
          </p>
          <p>
            You can export your data at any time from the returns and bookings pages. On account closure, you may request deletion of your data subject to our legal retention obligations.
          </p>
        </Section>

        <Section title="8. Limitation of liability">
          <p>
            To the maximum extent permitted by law, Levy Desk's total liability to you for any claim arising from or related to these terms or the service — whether in contract, tort, or otherwise — is limited to the total fees you paid to us in the 12 months before the claim arose.
          </p>
          <p>
            We are not liable for any indirect, consequential, or special losses, including penalties or interest charged by councils arising from incorrect or late returns, loss of income, or loss of data.
          </p>
          <p>
            Nothing in these terms limits liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded by law.
          </p>
        </Section>

        <Section title="9. Availability">
          <p>
            We aim to keep Levy Desk available at all times but do not guarantee uninterrupted access. We may carry out maintenance, updates, or emergency fixes that temporarily affect availability. We will give reasonable notice where possible.
          </p>
        </Section>

        <Section title="10. Changes to the service and these terms">
          <p>
            We may update these terms from time to time. Material changes will be notified by email at least 14 days before they take effect. Continued use of the service after the effective date constitutes acceptance of the updated terms.
          </p>
          <p>
            We may also add, remove, or change features of the service. We will give reasonable notice of significant feature removals that affect paid plan users.
          </p>
        </Section>

        <Section title="11. Governing law">
          <p>
            These terms are governed by the law of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales, except where you have rights under consumer protection law that cannot be excluded.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For questions about these terms, email <a href="mailto:hello@levydesk.co.uk" className="text-orange-600 hover:underline">hello@levydesk.co.uk</a>.
          </p>
        </Section>

      </main>

      <MarketingFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-900 border-b border-stone-200 pb-2">{title}</h2>
      <div className="space-y-3 text-stone-600 leading-relaxed text-sm">{children}</div>
    </section>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
      <span>{children}</span>
    </li>
  )
}
