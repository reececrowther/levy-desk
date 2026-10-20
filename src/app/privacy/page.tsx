import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | Levy Desk' },
  description: 'How Levy Desk collects, uses, and protects your personal data. UK GDPR compliant.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '20 October 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf8f2' }}>
      <MarketingNav />

      <main className="mx-auto max-w-3xl px-6 py-16 space-y-10">

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Privacy Policy</h1>
          <p className="text-sm text-stone-500">Last updated: {LAST_UPDATED}</p>
          <p className="text-stone-600 leading-relaxed">
            This policy explains what personal data Levy Desk collects, how we use it, who we share it with, and your rights under UK data protection law (UK GDPR and the Data Protection Act 2018).
          </p>
        </div>

        <Section title="1. Who we are">
          <p>
            Levy Desk is a trading name operated as a sole trader in the United Kingdom.
          </p>
          <p>
            We are the data controller for personal data processed through levydesk.co.uk. For data protection enquiries, contact us at <a href="mailto:privacy@levydesk.co.uk" className="text-orange-600 hover:underline">privacy@levydesk.co.uk</a>.
          </p>
        </Section>

        <Section title="2. What data we collect">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-600">
                <th className="pb-2 font-medium pr-4">Category</th>
                <th className="pb-2 font-medium pr-4">Examples</th>
                <th className="pb-2 font-medium">Why</th>
              </tr>
            </thead>
            <tbody className="text-stone-600 divide-y divide-stone-100">
              <tr>
                <td className="py-2.5 pr-4 align-top font-medium text-stone-800">Account data</td>
                <td className="py-2.5 pr-4 align-top">Email address, name</td>
                <td className="py-2.5 align-top">Authentication and account management</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 align-top font-medium text-stone-800">Booking data</td>
                <td className="py-2.5 pr-4 align-top">Check-in/out dates, guest counts, gross income, booking source</td>
                <td className="py-2.5 align-top">Calculating visitor levies and producing returns</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 align-top font-medium text-stone-800">Property data</td>
                <td className="py-2.5 pr-4 align-top">Property name, address, postcode, council, accommodation type</td>
                <td className="py-2.5 align-top">Applying the correct levy rules per council</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 align-top font-medium text-stone-800">Workspace data</td>
                <td className="py-2.5 pr-4 align-top">Business name, VAT number, plan tier</td>
                <td className="py-2.5 align-top">Account and billing management</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 align-top font-medium text-stone-800">Payment data</td>
                <td className="py-2.5 pr-4 align-top">Billing name, last 4 digits of card, subscription status</td>
                <td className="py-2.5 align-top">Processing subscription payments via Stripe</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 align-top font-medium text-stone-800">Usage data</td>
                <td className="py-2.5 pr-4 align-top">Pages visited, actions taken, approximate location (country/region)</td>
                <td className="py-2.5 align-top">Improving the product via Google Analytics</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-stone-500">
            We do not collect or store full payment card numbers. Card processing is handled entirely by Stripe.
          </p>
        </Section>

        <Section title="3. Lawful basis for processing">
          <p>We process your personal data on the following legal bases under UK GDPR:</p>
          <ul className="space-y-2 text-stone-600">
            <Li><strong>Contract performance</strong> — processing your booking and property data to provide the levy calculation and return-filing service you signed up for.</Li>
            <Li><strong>Legitimate interests</strong> — product analytics (Google Analytics, aggregated and anonymised) and transactional email reminders about filing deadlines. We have assessed that these interests are not overridden by your rights.</Li>
            <Li><strong>Legal obligation</strong> — retaining financial records for the periods required by HMRC and UK tax law.</Li>
          </ul>
        </Section>

        <Section title="4. How we use your data">
          <ul className="space-y-2 text-stone-600">
            <Li>Authenticating you via magic link email</Li>
            <Li>Calculating visitor levy amounts for each booking</Li>
            <Li>Generating quarterly return packs (PDF and CSV)</Li>
            <Li>Sending filing deadline reminders and nil-return notifications</Li>
            <Li>Processing subscription payments</Li>
            <Li>Displaying aggregated usage in your workspace audit log</Li>
            <Li>Improving the product using anonymised analytics</Li>
          </ul>
          <p>We do not sell your data. We do not use your data for advertising.</p>
        </Section>

        <Section title="5. Third parties we share data with">
          <div className="space-y-4">
            {[
              {
                name: 'Stripe',
                role: 'Payment processing',
                detail: 'Processes subscription payments. Card data is stored and processed by Stripe under their own privacy policy. Stripe is certified to PCI DSS Level 1.',
                link: 'stripe.com/gb/privacy',
              },
              {
                name: 'Supabase / Neon',
                role: 'Database hosting',
                detail: 'Your account, booking, property, and return data is stored in a managed PostgreSQL database. Data is stored in the EU.',
                link: null,
              },
              {
                name: 'Resend',
                role: 'Transactional email',
                detail: 'Sends magic-link sign-in emails and filing reminders. Only your email address and the content of the email are shared.',
                link: 'resend.com/privacy',
              },
              {
                name: 'Vercel',
                role: 'Hosting and compute',
                detail: 'Hosts and runs the Levy Desk application. Request logs may include your IP address. Data is processed in the EU/UK.',
                link: 'vercel.com/legal/privacy-policy',
              },
              {
                name: 'Google Analytics',
                role: 'Usage analytics',
                detail: 'Collects anonymised page-view and interaction data. IP addresses are anonymised. You can opt out via the Google Analytics opt-out browser add-on.',
                link: 'policies.google.com/privacy',
              },
            ].map((t) => (
              <div key={t.name} className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-stone-800 text-sm">{t.name} — {t.role}</p>
                    <p className="text-sm text-stone-500 mt-1">{t.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-stone-500">
            All third-party processors have been assessed to provide adequate data protection. Where transfers outside the UK/EEA occur, they are covered by UK adequacy regulations or standard contractual clauses.
          </p>
        </Section>

        <Section title="6. How long we keep your data">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-600">
                <th className="pb-2 font-medium pr-4">Data type</th>
                <th className="pb-2 font-medium">Retention period</th>
              </tr>
            </thead>
            <tbody className="text-stone-600 divide-y divide-stone-100">
              <tr>
                <td className="py-2.5 pr-4 align-top">Account and workspace data</td>
                <td className="py-2.5 align-top">Retained while your account is active. Deleted within 30 days of a verified account closure request.</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 align-top">Booking and levy calculation data</td>
                <td className="py-2.5 align-top">6 years from the date of the booking (HMRC record-keeping requirement for tax records). Deleted on account closure after this period.</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 align-top">Payment and billing data</td>
                <td className="py-2.5 align-top">7 years (legal requirement). Payment card data is retained by Stripe under their own policy.</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 align-top">Analytics data</td>
                <td className="py-2.5 align-top">26 months (Google Analytics default, anonymised).</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="7. Your rights">
          <p>Under UK GDPR you have the following rights. To exercise any of them, email <a href="mailto:privacy@levydesk.co.uk" className="text-orange-600 hover:underline">privacy@levydesk.co.uk</a>. We will respond within one calendar month.</p>
          <ul className="space-y-2 text-stone-600">
            <Li><strong>Right of access</strong> — request a copy of all personal data we hold about you.</Li>
            <Li><strong>Right to rectification</strong> — ask us to correct inaccurate or incomplete data.</Li>
            <Li><strong>Right to erasure</strong> — ask us to delete your data, subject to legal retention requirements (e.g. tax records).</Li>
            <Li><strong>Right to restrict processing</strong> — ask us to pause processing while a dispute is resolved.</Li>
            <Li><strong>Right to data portability</strong> — receive your booking and return data in a machine-readable format (CSV).</Li>
            <Li><strong>Right to object</strong> — object to processing based on legitimate interests, including analytics.</Li>
          </ul>
          <p>
            If you are unhappy with how we have handled your data, you have the right to lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a> or by calling 0303 123 1113.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            Levy Desk uses a session cookie to keep you signed in (a JSON Web Token stored as an httpOnly cookie). This is strictly necessary for the service to function and does not require consent.
          </p>
          <p>
            Google Analytics uses cookies to distinguish unique visitors. These are analytics cookies. You can block them using your browser settings or a browser extension. We do not use advertising or tracking cookies.
          </p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>
            We may update this policy when our data practices change or when required by law. Material changes will be notified by email to registered users. The "last updated" date at the top of this page reflects the most recent revision.
          </p>
        </Section>

        <Section title="10. Contact us">
          <p>For any data protection questions or to exercise your rights:</p>
          <p>
            Email: <a href="mailto:privacy@levydesk.co.uk" className="text-orange-600 hover:underline">privacy@levydesk.co.uk</a>
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

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
      {children}
    </div>
  )
}
