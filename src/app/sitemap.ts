import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.levydesk.co.uk'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: '2026-10-20',
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: '2026-10-20',
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: '2026-10-20',
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: '2026-10-20',
    },
    {
      url: `${BASE_URL}/edinburgh-visitor-levy`,
      lastModified: '2026-10-20',
    },
    {
      url: `${BASE_URL}/edinburgh-visitor-levy/how-to-file`,
      lastModified: '2026-10-20',
    },
    {
      url: `${BASE_URL}/glasgow-visitor-levy`,
      lastModified: '2026-10-20',
    },
    {
      url: `${BASE_URL}/cardiff-tourism-levy`,
      lastModified: '2026-10-20',
    },
    {
      url: `${BASE_URL}/edinburgh-visitor-levy/airbnb-hosts`,
      lastModified: '2026-10-30',
    },
    {
      url: `${BASE_URL}/edinburgh-visitor-levy/what-if-i-miss-the-deadline`,
      lastModified: '2026-10-30',
    },
    {
      url: `${BASE_URL}/visitor-levy-tracker`,
      lastModified: '2026-10-30',
    },
  ]
}
