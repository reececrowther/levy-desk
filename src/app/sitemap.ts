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
      url: `${BASE_URL}/glasgow-visitor-levy`,
      lastModified: '2026-10-20',
    },
    {
      url: `${BASE_URL}/cardiff-tourism-levy`,
      lastModified: '2026-10-20',
    },
  ]
}
