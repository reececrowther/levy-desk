import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://levydesk.co.uk'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep app routes out of search results
        disallow: [
          '/dashboard',
          '/properties',
          '/bookings',
          '/imports',
          '/exceptions',
          '/returns',
          '/audit-log',
          '/account',
          '/clients',
          '/admin',
          '/invite',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
