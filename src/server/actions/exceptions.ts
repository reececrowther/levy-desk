'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { recalculate } from '@/lib/recalculate'
import { requireWorkspace } from './auth-helpers'
import { Flag } from '@/levy/flags'

/** Add a flag to a booking's acknowledgedFlags so it no longer appears in the queue */
export async function acknowledgeFlag(bookingId: string, flag: string) {
  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId } })
  const property = await db.property.findUniqueOrThrow({ where: { id: booking.propertyId } })
  await requireWorkspace(property.workspaceId)

  if (booking.acknowledgedFlags.includes(flag)) return

  await db.booking.update({
    where: { id: bookingId },
    data: { acknowledgedFlags: { push: flag } },
  })

  revalidatePath('/exceptions')
}

const FixGrossSchema = z.object({
  bookingId: z.string().cuid(),
  guestPaidGrossPounds: z.coerce.number().min(0),
})

/** Fix BASE_IS_PAYOUT_NOT_GROSS — user supplies the correct gross */
export async function fixGrossAmount(input: z.infer<typeof FixGrossSchema>) {
  const { bookingId, guestPaidGrossPounds } = FixGrossSchema.parse(input)

  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId } })
  const property = await db.property.findUniqueOrThrow({ where: { id: booking.propertyId } })
  await requireWorkspace(property.workspaceId)

  const guestPaidGrossPence = Math.round(guestPaidGrossPounds * 100)

  await db.booking.update({
    where: { id: bookingId },
    data: { guestPaidGrossPence },
  })

  await recalculate(bookingId)
  revalidatePath('/exceptions')
  revalidatePath('/bookings')
}

const FixGuestsSchema = z.object({
  bookingId: z.string().cuid(),
  adults: z.coerce.number().int().min(0),
  under18s: z.coerce.number().int().min(0).default(0),
})

/** Fix WELSH_GUEST_COUNT_MISSING — user supplies the correct guest count */
export async function fixGuestCount(input: z.infer<typeof FixGuestsSchema>) {
  const { bookingId, adults, under18s } = FixGuestsSchema.parse(input)

  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId } })
  const property = await db.property.findUniqueOrThrow({ where: { id: booking.propertyId } })
  await requireWorkspace(property.workspaceId)

  await db.booking.update({
    where: { id: bookingId },
    data: { adults, under18s },
  })

  await recalculate(bookingId)
  revalidatePath('/exceptions')
  revalidatePath('/bookings')
}

const FixCommissionSchema = z.object({
  bookingId: z.string().cuid(),
  commissionPounds: z.coerce.number().min(0),
})

/** Fix COMMISSION_UNKNOWN — user supplies the commission amount */
export async function fixCommission(input: z.infer<typeof FixCommissionSchema>) {
  const { bookingId, commissionPounds } = FixCommissionSchema.parse(input)

  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId } })
  const property = await db.property.findUniqueOrThrow({ where: { id: booking.propertyId } })
  await requireWorkspace(property.workspaceId)

  await db.booking.update({
    where: { id: bookingId },
    data: { commissionPence: Math.round(commissionPounds * 100) },
  })

  await recalculate(bookingId)
  revalidatePath('/exceptions')
  revalidatePath('/bookings')
}
