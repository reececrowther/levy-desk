'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireWorkspace } from './auth-helpers'
import { recalculate } from '@/lib/recalculate'
import type { BookingSource, BookingStatus, Prisma } from '@prisma/client'

const BookingSchema = z.object({
  propertyId: z.string().cuid(),
  source: z.enum(['AIRBNB', 'BOOKING_COM', 'VRBO', 'DIRECT', 'SOFTWARE', 'OTHER']),
  externalRef: z.string().optional(),
  bookedAt: z.string().date('Invalid date'),
  firstPaymentAt: z.string().date('Invalid date').optional(),
  checkIn: z.string().date('Invalid date'),
  checkOut: z.string().date('Invalid date'),
  adults: z.coerce.number().int().min(0),
  under18s: z.coerce.number().int().min(0).default(0),
  guestPaidGrossPence: z.coerce.number().int().min(0),
  extrasPence: z.coerce.number().int().min(0).default(0),
  commissionPence: z.coerce.number().int().min(0).optional(),
  payoutPence: z.coerce.number().int().min(0).optional(),
  currency: z.string().length(3).default('GBP'),
  status: z.enum(['CONFIRMED', 'CANCELLED', 'NO_SHOW']).default('CONFIRMED'),
}).refine((d) => d.checkOut > d.checkIn, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
})

export type BookingFormValues = z.infer<typeof BookingSchema>


export async function createBooking(input: BookingFormValues) {
  const property = await db.property.findUniqueOrThrow({
    where: { id: input.propertyId },
  })
  await requireWorkspace(property.workspaceId)

  const data = BookingSchema.parse(input)

  const booking = await db.booking.create({
    data: {
      propertyId: data.propertyId,
      source: data.source as BookingSource,
      externalRef: data.externalRef,
      bookedAt: new Date(data.bookedAt),
      firstPaymentAt: data.firstPaymentAt ? new Date(data.firstPaymentAt) : null,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      adults: data.adults,
      under18s: data.under18s,
      guestPaidGrossPence: data.guestPaidGrossPence,
      extrasPence: data.extrasPence,
      commissionPence: data.commissionPence,
      payoutPence: data.payoutPence,
      currency: data.currency,
      status: data.status as BookingStatus,
    },
  })

  await recalculate(booking.id)
  revalidatePath('/bookings')
  return booking
}

export async function updateBookingStatus(
  id: string,
  status: 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW',
) {
  const booking = await db.booking.findUniqueOrThrow({ where: { id } })
  const property = await db.property.findUniqueOrThrow({ where: { id: booking.propertyId } })
  await requireWorkspace(property.workspaceId)

  await db.booking.update({ where: { id }, data: { status: status as BookingStatus } })
  await recalculate(id)
  revalidatePath('/bookings')
}

const UpdateBookingSchema = z.object({
  id: z.string().cuid(),
  guestPaidGrossPence: z.coerce.number().int().min(0).optional(),
  extrasPence: z.coerce.number().int().min(0).optional(),
  commissionPence: z.coerce.number().int().min(0).optional(),
  payoutPence: z.coerce.number().int().min(0).optional(),
  adults: z.coerce.number().int().min(0).optional(),
  under18s: z.coerce.number().int().min(0).optional(),
})

export async function updateBooking(input: z.infer<typeof UpdateBookingSchema>) {
  const { id, ...changes } = UpdateBookingSchema.parse(input)

  const booking = await db.booking.findUniqueOrThrow({ where: { id } })
  const property = await db.property.findUniqueOrThrow({ where: { id: booking.propertyId } })
  const { workspace, user } = await requireWorkspace(property.workspaceId)
  if (!workspace) throw new Error('No workspace.')

  // Check if this booking falls within a locked return period
  const lockedReturn = await db.levyReturn.findFirst({
    where: {
      workspaceId: workspace.id,
      council: property.council,
      lockedAt: { not: null },
      periodStart: { lte: booking.checkIn },
      periodEnd: { gte: booking.checkIn },
    },
  })

  const before: Record<string, unknown> = {}
  const after: Record<string, unknown> = {}

  if (changes.guestPaidGrossPence !== undefined) {
    before.guestPaidGrossPence = booking.guestPaidGrossPence
    after.guestPaidGrossPence = changes.guestPaidGrossPence
  }
  if (changes.adults !== undefined) {
    before.adults = booking.adults
    after.adults = changes.adults
  }
  if (changes.under18s !== undefined) {
    before.under18s = booking.under18s
    after.under18s = changes.under18s
  }
  if (changes.commissionPence !== undefined) {
    before.commissionPence = booking.commissionPence
    after.commissionPence = changes.commissionPence
  }

  if (lockedReturn) {
    await db.auditLog.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        action: 'AMENDMENT',
        entityType: 'Booking',
        entityId: id,
        before: before as Prisma.InputJsonValue,
        after: after as Prisma.InputJsonValue,
      },
    })
  }

  // Filter out undefined values before the update
  const updateData: Record<string, number> = {}
  for (const [k, v] of Object.entries(changes)) {
    if (v !== undefined) updateData[k] = v
  }

  await db.booking.update({ where: { id }, data: updateData })
  await recalculate(id)
  revalidatePath('/bookings')
  revalidatePath('/exceptions')
}
