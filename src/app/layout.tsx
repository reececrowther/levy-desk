import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.levydesk.co.uk'),
  title: {
    default: 'Levy Desk — Visitor Levy Returns for Holiday Lets',
    template: '%s | Levy Desk',
  },
  description:
    'Levy Desk turns holiday-let bookings into correct, ready-to-file visitor levy returns for councils in Scotland and Wales. Free calculator included.',
  keywords: [
    'visitor levy',
    'tourist tax Scotland',
    'Edinburgh visitor levy',
    'Wales visitor accommodation levy',
    'holiday let levy return',
    'Airbnb levy Scotland',
  ],
  authors: [{ name: 'Levy Desk' }],
  creator: 'Levy Desk',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Levy Desk',
    title: 'Levy Desk — Visitor Levy Returns for Holiday Lets',
    description:
      'Correct, ready-to-file visitor levy returns for holiday let owners and agents in Scotland and Wales.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Levy Desk — Visitor Levy Returns for Holiday Lets',
    description:
      'Correct, ready-to-file visitor levy returns for holiday let owners and agents in Scotland and Wales.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WVZC9WRDDT"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WVZC9WRDDT');
          `}
        </Script>
      </body>
    </html>
  )
}
