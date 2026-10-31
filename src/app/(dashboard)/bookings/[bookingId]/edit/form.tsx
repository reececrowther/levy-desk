'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { editBooking } from '@/server/actions/bookings'
import type { Booking, Property } from '@prisma/client'

interface Props {
  booking: Booking & { property: Property }
  properties: { id: string; name: string }[]
}

function poundsFromPence(pence: number | null | undefined): string {
  if (pence == null) return ''
  return (pence / 100).toFixed(2)
}

function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function EditBookingForm({ booking, properties }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(fd: FormData) {
    setError(null)
    setSubmitting(true)
    try {
      await editBooking({
        id: booking.id,
        propertyId: fd.get('propertyId') as string,
        source: fd.get('source') as 'DIRECT',
        externalRef: (fd.get('externalRef') as string) || undefined,
        bookedAt: fd.get('bookedAt') as string,
        firstPaymentAt: (fd.get('firstPaymentAt') as string) || undefined,
        checkIn: fd.get('checkIn') as string,
        checkOut: fd.get('checkOut') as string,
        adults: Number(fd.get('adults')),
        under18s: Number(fd.get('under18s') ?? 0),
        guestPaidGrossPence: Math.round(Number(fd.get('guestPaidGross')) * 100),
        extrasPence: Math.round(Number(fd.get('extras') ?? 0) * 100),
        commissionPence: fd.get('commission') ? Math.round(Number(fd.get('commission')) * 100) : undefined,
        payoutPence: fd.get('payout') ? Math.round(Number(fd.get('payout')) * 100) : undefined,
        status: (fd.get('status') as 'CONFIRMED') ?? 'CONFIRMED',
      })
      router.push('/bookings')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field id="propertyId" label="Property">
        <select
          id="propertyId"
          name="propertyId"
          required
          defaultValue={booking.propertyId}
          className="flex h-9 w-full rounded-md border border-stone-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field id="checkIn" label="Check-in">
          <Input id="checkIn" name="checkIn" type="date" required defaultValue={toDateInput(booking.checkIn)} />
        </Field>
        <Field id="checkOut" label="Check-out">
          <Input id="checkOut" name="checkOut" type="date" required defaultValue={toDateInput(booking.checkOut)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field id="bookedAt" label="Booking date">
          <Input id="bookedAt" name="bookedAt" type="date" required defaultValue={toDateInput(booking.bookedAt)} />
        </Field>
        <Field id="firstPaymentAt" label="First payment date">
          <Input id="firstPaymentAt" name="firstPaymentAt" type="date"
            defaultValue={booking.firstPaymentAt ? toDateInput(booking.firstPaymentAt) : ''} />
        </Field>
      </div>

      <Field id="source" label="Source">
        <select
          id="source"
          name="source"
          required
          defaultValue={booking.source}
          className="flex h-9 w-full rounded-md border border-stone-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
        >
          <option value="DIRECT">Direct</option>
          <option value="AIRBNB">Airbnb</option>
          <option value="BOOKING_COM">Booking.com</option>
          <option value="VRBO">Vrbo</option>
          <option value="SOFTWARE">Booking software</option>
          <option value="OTHER">Other</option>
        </select>
      </Field>

      <Field id="externalRef" label="Reference / confirmation number (optional)">
        <Input id="externalRef" name="externalRef" defaultValue={booking.externalRef ?? ''} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field id="adults" label="Adults">
          <Input id="adults" name="adults" type="number" min="0" defaultValue={booking.adults} required />
        </Field>
        <Field id="under18s" label="Under-18s">
          <Input id="under18s" name="under18s" type="number" min="0" defaultValue={booking.under18s} />
        </Field>
      </div>

      <div className="rounded-md border border-stone-200 p-3 space-y-3">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Financials (£)</p>
        <Field id="guestPaidGross" label="Guest-paid gross (£)">
          <Input id="guestPaidGross" name="guestPaidGross" type="number" step="0.01" min="0"
            defaultValue={poundsFromPence(booking.guestPaidGrossPence)} required />
        </Field>
        <Field id="extras" label="Separately priced extras — meals, parking (£)">
          <Input id="extras" name="extras" type="number" step="0.01" min="0"
            defaultValue={poundsFromPence(booking.extrasPence)} />
        </Field>
        <Field id="commission" label="Platform commission (£, optional)">
          <Input id="commission" name="commission" type="number" step="0.01" min="0"
            defaultValue={poundsFromPence(booking.commissionPence)} placeholder="0.00" />
        </Field>
        <Field id="payout" label="Host payout (£, optional)">
          <Input id="payout" name="payout" type="number" step="0.01" min="0"
            defaultValue={poundsFromPence(booking.payoutPence)} placeholder="0.00" />
        </Field>
      </div>

      <Field id="status" label="Status">
        <select
          id="status"
          name="status"
          defaultValue={booking.status}
          className="flex h-9 w-full rounded-md border border-stone-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
        >
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No-show</option>
        </select>
      </Field>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
