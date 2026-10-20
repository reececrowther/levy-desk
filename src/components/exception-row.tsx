'use client'

import { useTransition, useState } from 'react'
import { acknowledgeFlag, fixGrossAmount, fixGuestCount, fixCommission } from '@/server/actions/exceptions'
import { Flag } from '@/levy/flags'
import type { FlagDescription } from '@/lib/flag-descriptions'

type BookingSnapshot = {
  guestPaidGrossPence: number
  adults: number
  under18s: number
  commissionPence: number
}

type Props = {
  bookingId: string
  flag: string
  description: FlagDescription
  booking: BookingSnapshot
}

const SEVERITY_STYLE: Record<string, string> = {
  error: 'border-l-red-500',
  warning: 'border-l-amber-400',
  info: 'border-l-blue-400',
}

export function ExceptionRow({ bookingId, flag, description, booking }: Props) {
  const [pending, startTransition] = useTransition()
  const [expanded, setExpanded] = useState(false)

  function ack() {
    startTransition(async () => {
      await acknowledgeFlag(bookingId, flag)
    })
  }

  return (
    <div className={`border-l-4 py-4 pl-4 ${SEVERITY_STYLE[description.severity] ?? 'border-l-stone-300'}`}>
      <button
        className="flex w-full items-start justify-between text-left"
        onClick={() => setExpanded((x) => !x)}
      >
        <div>
          <p className="text-sm font-medium text-stone-900">{description.title}</p>
          <p className="mt-0.5 font-mono text-[11px] text-stone-400">{flag}</p>
        </div>
        <span className="ml-4 shrink-0 text-xs text-stone-400">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-stone-600">{description.detail}</p>

          {/* Fix form — varies by flag */}
          {flag === Flag.BASE_IS_PAYOUT_NOT_GROSS && (
            <FixGrossForm
              bookingId={bookingId}
              currentPence={booking.guestPaidGrossPence}
              pending={pending}
              startTransition={startTransition}
            />
          )}

          {flag === Flag.WELSH_GUEST_COUNT_MISSING && (
            <FixGuestsForm
              bookingId={bookingId}
              currentAdults={booking.adults}
              currentUnder18s={booking.under18s}
              pending={pending}
              startTransition={startTransition}
            />
          )}

          {flag === Flag.COMMISSION_UNKNOWN && (
            <FixCommissionForm
              bookingId={bookingId}
              currentPence={booking.commissionPence}
              pending={pending}
              startTransition={startTransition}
            />
          )}

          {flag === Flag.WELSH_PROPERTY_UNREGISTERED && (
            <a
              href="/properties"
              className="inline-block rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
            >
              Edit property →
            </a>
          )}

          {flag === Flag.VAT_THRESHOLD_WARNING && (
            <a
              href="/account"
              className="inline-block rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
            >
              Account settings →
            </a>
          )}

          {description.acknowledgeOnly && (
            <button
              disabled={pending}
              onClick={ack}
              className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Acknowledge — remove from exceptions queue'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function FixGrossForm({
  bookingId,
  currentPence,
  pending,
  startTransition,
}: {
  bookingId: string
  currentPence: number
  pending: boolean
  startTransition: (fn: () => void) => void
}) {
  const [gross, setGross] = useState((currentPence / 100).toFixed(2))
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          await fixGrossAmount({ bookingId, guestPaidGrossPounds: parseFloat(gross) })
        })
      }}
      className="flex items-center gap-2"
    >
      <label className="text-sm text-stone-600">Guest-paid gross (£)</label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={gross}
        onChange={(e) => setGross(e.target.value)}
        className="w-32 rounded-md border border-stone-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Fix and recalculate'}
      </button>
    </form>
  )
}

function FixGuestsForm({
  bookingId,
  currentAdults,
  currentUnder18s,
  pending,
  startTransition,
}: {
  bookingId: string
  currentAdults: number
  currentUnder18s: number
  pending: boolean
  startTransition: (fn: () => void) => void
}) {
  const [adults, setAdults] = useState(String(currentAdults))
  const [under18s, setUnder18s] = useState(String(currentUnder18s))
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          await fixGuestCount({ bookingId, adults: parseInt(adults), under18s: parseInt(under18s) })
        })
      }}
      className="flex items-center gap-3"
    >
      <div className="flex items-center gap-1">
        <label className="text-sm text-stone-600">Adults</label>
        <input
          type="number"
          min="0"
          value={adults}
          onChange={(e) => setAdults(e.target.value)}
          className="w-16 rounded-md border border-stone-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>
      <div className="flex items-center gap-1">
        <label className="text-sm text-stone-600">Under-18s</label>
        <input
          type="number"
          min="0"
          value={under18s}
          onChange={(e) => setUnder18s(e.target.value)}
          className="w-16 rounded-md border border-stone-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Fix and recalculate'}
      </button>
    </form>
  )
}

function FixCommissionForm({
  bookingId,
  currentPence,
  pending,
  startTransition,
}: {
  bookingId: string
  currentPence: number
  pending: boolean
  startTransition: (fn: () => void) => void
}) {
  const [commission, setCommission] = useState((currentPence / 100).toFixed(2))
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          await fixCommission({ bookingId, commissionPounds: parseFloat(commission) })
        })
      }}
      className="flex items-center gap-2"
    >
      <label className="text-sm text-stone-600">Platform commission (£)</label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={commission}
        onChange={(e) => setCommission(e.target.value)}
        className="w-32 rounded-md border border-stone-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Fix and recalculate'}
      </button>
    </form>
  )
}
