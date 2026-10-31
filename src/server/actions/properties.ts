'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { lookupPostcode } from '@/lib/postcodes'
import { requireWorkspace } from './auth-helpers'
import { PLAN_LIMITS } from '@/lib/billing-config'
import type { AccommodationType, Country } from '@prisma/client'

const PropertySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  addressLine1: z.string().optional(),
  town: z.string().optional(),
  postcode: z.string().min(1, 'Postcode is required').max(8),
  council: z.string().min(1, 'Council is required'),
  country: z.enum(['SCOTLAND', 'WALES']),
  accommodationType: z.enum([
    'SELF_CATERING',
    'BNB_GUEST_HOUSE',
    'HOTEL',
    'HOSTEL_DORM',
    'CAMPSITE',
    'OTHER',
  ]),
  unitsOrRooms: z.coerce.number().int().min(1).default(1),
  licenceNumber: z.string().optional(),
  welshRegisterNumber: z.string().optional(),
  breakfastIncluded: z.boolean().default(false),
  breakfastRetailValuePence: z.coerce.number().int().min(0).optional(),
})

export type PropertyFormValues = z.infer<typeof PropertySchema>

export async function createProperty(input: PropertyFormValues) {
  const { workspace } = await requireWorkspace()
  if (!workspace) throw new Error('No workspace found. Create a workspace first.')

  const limits = PLAN_LIMITS[workspace.plan as keyof typeof PLAN_LIMITS]
  if (limits.maxProperties !== null) {
    const count = await db.property.count({ where: { workspaceId: workspace.id } })
    if (count >= limits.maxProperties) {
      throw new Error(
        `Your ${limits.label} plan is limited to ${limits.maxProperties} ${limits.maxProperties === 1 ? 'property' : 'properties'}. ` +
        `Upgrade your plan on the Account page to add more.`,
      )
    }
  }

  const data = PropertySchema.parse(input)

  const property = await db.property.create({
    data: {
      workspaceId: workspace.id,
      name: data.name,
      addressLine1: data.addressLine1,
      town: data.town,
      postcode: data.postcode.replace(/\s+/g, '').toUpperCase(),
      council: data.council,
      country: data.country as Country,
      accommodationType: data.accommodationType as AccommodationType,
      unitsOrRooms: data.unitsOrRooms,
      licenceNumber: data.licenceNumber,
      welshRegisterNumber: data.welshRegisterNumber,
      breakfastIncluded: data.breakfastIncluded,
      breakfastRetailValuePence: data.breakfastRetailValuePence,
    },
  })

  revalidatePath('/properties')
  return property
}

export async function updateProperty(id: string, input: Partial<PropertyFormValues>) {
  const property = await db.property.findUniqueOrThrow({ where: { id } })
  await requireWorkspace(property.workspaceId)

  const data = PropertySchema.partial().parse(input)

  const updated = await db.property.update({
    where: { id },
    data,
  })

  revalidatePath('/properties')
  revalidatePath(`/properties/${id}`)
  return updated
}

/** Look up a postcode and return suggested council + country */
export async function lookupPropertyPostcode(postcode: string) {
  return lookupPostcode(postcode)
}
