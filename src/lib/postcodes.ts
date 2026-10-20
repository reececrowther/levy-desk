import { db } from './db'

// Maps postcodes.io admin_district values to our council slugs
const COUNCIL_MAP: Record<string, string> = {
  // Scotland
  'City of Edinburgh': 'edinburgh',
  'Edinburgh': 'edinburgh',
  'Glasgow City': 'glasgow',
  'Glasgow': 'glasgow',
  'Aberdeen City': 'aberdeen',
  'Aberdeen': 'aberdeen',
  'Stirling': 'stirling',
  'West Dunbartonshire': 'west_dunbartonshire',
  'Highland': 'highland',
  // Wales
  'Cardiff': 'cardiff',
}

interface PostcodesIoResult {
  admin_district: string
  country: string
}

interface LookupResult {
  council: string | null
  adminDistrict: string | null
  country: string | null
}

export async function lookupPostcode(rawPostcode: string): Promise<LookupResult> {
  const postcode = rawPostcode.replace(/\s+/g, '').toUpperCase()

  // Check cache first
  const cached = await db.postcodeCache.findUnique({ where: { postcode } })
  if (cached && isFresh(cached.cachedAt)) {
    return {
      council: cached.council,
      adminDistrict: cached.adminDistrict,
      country: cached.country,
    }
  }

  // Fetch from postcodes.io
  const result = await fetchPostcodesIo(postcode)

  // Upsert cache
  await db.postcodeCache.upsert({
    where: { postcode },
    create: {
      postcode,
      council: result.council,
      adminDistrict: result.adminDistrict,
      country: result.country,
    },
    update: {
      council: result.council,
      adminDistrict: result.adminDistrict,
      country: result.country,
      cachedAt: new Date(),
    },
  })

  return result
}

async function fetchPostcodesIo(postcode: string): Promise<LookupResult> {
  const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
  const res = await fetch(url, { next: { revalidate: 0 } })

  if (!res.ok) {
    return { council: null, adminDistrict: null, country: null }
  }

  const json = (await res.json()) as { status: number; result: PostcodesIoResult }

  if (json.status !== 200 || !json.result) {
    return { council: null, adminDistrict: null, country: null }
  }

  const { admin_district: adminDistrict, country } = json.result
  const council = COUNCIL_MAP[adminDistrict] ?? null

  return { council, adminDistrict, country }
}

// Cache entries are fresh for 30 days
function isFresh(cachedAt: Date): boolean {
  return Date.now() - cachedAt.getTime() < 30 * 24 * 60 * 60 * 1000
}
