'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { calculate } from '@/levy/calculator'
import { SCHEME_RULES } from '@/levy/rules'
import type { AccommodationType, Country } from '@/levy/types'

// ─── Council data ─────────────────────────────────────────────────────────────

const COUNCILS = [
  { value: 'edinburgh',          label: 'Edinburgh',           country: 'scotland' as Country, liveFrom: '2026-07-24', status: 'Live' },
  { value: 'glasgow',            label: 'Glasgow',             country: 'scotland' as Country, liveFrom: '2027-01-25', status: 'Confirmed' },
  { value: 'aberdeen',           label: 'Aberdeen',            country: 'scotland' as Country, liveFrom: '2027-04-01', status: 'Confirmed' },
  { value: 'stirling',           label: 'Stirling',            country: 'scotland' as Country, liveFrom: '2027-06-01', status: 'Confirmed' },
  { value: 'west_dunbartonshire', label: 'West Dunbartonshire', country: 'scotland' as Country, liveFrom: '2027-07-01', status: 'Confirmed' },
  { value: 'cardiff',            label: 'Cardiff',             country: 'wales'    as Country, liveFrom: '2027-04-01', status: 'Confirmed' },
] as const

type CouncilValue = (typeof COUNCILS)[number]['value']

const ACCOMMODATION_OPTIONS: { value: AccommodationType; label: string }[] = [
  { value: 'self_catering',  label: 'Self-catering / holiday let' },
  { value: 'bnb_guest_house', label: 'B&B / guest house' },
  { value: 'hotel',          label: 'Hotel' },
  { value: 'hostel_dorm',    label: 'Hostel (dorm)' },
  { value: 'campsite',       label: 'Campsite' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pence(n: number): string {
  return `£${(n / 100).toFixed(2)}`
}

function parsePounds(val: string): number {
  const n = parseFloat(val.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : Math.round(n * 100)
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Inputs {
  council: CouncilValue
  checkIn: string
  checkOut: string
  grossPounds: string
  accommodationType: AccommodationType
  vatRegistered: boolean
  adults: number
  under18s: number
}

const DEFAULTS: Inputs = {
  council: 'edinburgh',
  checkIn: '2026-11-01',
  checkOut: '2026-11-06',
  grossPounds: '600',
  accommodationType: 'self_catering',
  vatRegistered: false,
  adults: 2,
  under18s: 0,
}

export function LevyCalculator({
  defaultCouncil = 'edinburgh',
  defaultCheckIn,
  defaultCheckOut,
}: {
  defaultCouncil?: CouncilValue
  defaultCheckIn?: string
  defaultCheckOut?: string
} = {}) {
  const [emailInput, setEmailInput] = useState('')
  const [emailState, setEmailState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const prevCouncil = useRef(defaultCouncil)

  const [inputs, setInputs] = useState<Inputs>({
    ...DEFAULTS,
    council: defaultCouncil,
    checkIn: defaultCheckIn ?? DEFAULTS.checkIn,
    checkOut: defaultCheckOut ?? DEFAULTS.checkOut,
  })

  const council = COUNCILS.find((c) => c.value === inputs.council)!
  const isWales = council.country === 'wales'

  function set<K extends keyof Inputs>(key: K, value: Inputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  const result = useMemo(() => {
    if (!inputs.checkIn || !inputs.checkOut) return null
    if (inputs.checkIn >= inputs.checkOut) return null

    const grossPence = parsePounds(inputs.grossPounds)
    if (!isWales && grossPence <= 0) return null
    if (isWales && inputs.adults + inputs.under18s <= 0) return null

    const booking = {
      id: 'calc-preview',
      source: 'direct' as const,
      bookedAt: inputs.checkIn,
      firstPaymentAt: inputs.checkIn,
      checkIn: inputs.checkIn,
      checkOut: inputs.checkOut,
      adults: inputs.adults,
      under18s: inputs.under18s,
      guestPaidGrossPence: grossPence,
      extrasPence: 0,
      currency: 'GBP',
      status: 'confirmed' as const,
    }

    const property = {
      id: 'calc-preview',
      name: 'Preview property',
      council: inputs.council,
      country: council.country,
      accommodationType: inputs.accommodationType,
      unitsOrRooms: 1,
      vatRegistered: inputs.vatRegistered,
      breakfastIncluded: false,
      ...(isWales ? { welshRegisterNumber: 'WR-ESTIMATE' } : {}),
    }

    try {
      return calculate(booking, property, { rules: SCHEME_RULES })
    } catch {
      return null
    }
  }, [inputs, isWales, council.country])

  // Fire a GA4 event 800ms after the user stops changing inputs, if a valid
  // result is showing. Fires again whenever the council changes.
  useEffect(() => {
    if (!result || result.schemeRuleId === 'no-rule') return
    const timer = setTimeout(() => {
      const g = typeof window !== 'undefined' && (window as Window & { gtag?: (...a: unknown[]) => void }).gtag
      if (g) {
        g('event', 'calculator_result', {
          council: inputs.council,
          nights_charged: result.nightsCharged,
          levy_pence: result.levyPence,
          vat_registered: inputs.vatRegistered,
        })
      }
    }, 800)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  // Reset email form if the user switches council (so they can capture for the new one)
  useEffect(() => {
    if (inputs.council !== prevCouncil.current) {
      prevCouncil.current = inputs.council
      if (emailState === 'success') setEmailState('idle')
    }
  }, [inputs.council, emailState])

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!result) return
    setEmailState('loading')
    try {
      const res = await fetch('/api/calculator-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, council: inputs.council, levyPence: result.levyPence }),
      })
      if (res.ok) {
        setEmailState('success')
        const g = typeof window !== 'undefined' && (window as Window & { gtag?: (...a: unknown[]) => void }).gtag
        if (g) g('event', 'calculator_email_capture', { council: inputs.council, levy_pence: result.levyPence })
      } else {
        setEmailState('error')
      }
    } catch {
      setEmailState('error')
    }
  }

  const hasLevy = result && result.levyPence > 0
  const noRule = result && result.schemeRuleId === 'no-rule'
  const preStart = !noRule && result && result.nightsCharged === 0 &&
    inputs.checkIn < council.liveFrom

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ── Inputs ── */}
      <div className="rounded-xl bg-white border border-stone-200 p-6 space-y-5 shadow-sm">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-stone-700">Council</label>
          <select
            value={inputs.council}
            onChange={(e) => set('council', e.target.value as CouncilValue)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {COUNCILS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label} ({c.status === 'Live' ? 'live' : `from ${new Date(c.liveFrom).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">Check-in</label>
            <input
              type="date"
              value={inputs.checkIn}
              onChange={(e) => set('checkIn', e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">Check-out</label>
            <input
              type="date"
              value={inputs.checkOut}
              onChange={(e) => set('checkOut', e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {!isWales && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">
              Guest-paid gross (excl. extras)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-stone-400">£</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={inputs.grossPounds}
                onChange={(e) => set('grossPounds', e.target.value)}
                className="w-full rounded-lg border border-stone-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}

        {isWales && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Adults</label>
              <input
                type="number"
                min="0"
                value={inputs.adults}
                onChange={(e) => set('adults', parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Under-18s</label>
              <input
                type="number"
                min="0"
                value={inputs.under18s}
                onChange={(e) => set('under18s', parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-stone-700">Accommodation type</label>
          <select
            value={inputs.accommodationType}
            onChange={(e) => set('accommodationType', e.target.value as AccommodationType)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {ACCOMMODATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inputs.vatRegistered}
            onChange={(e) => set('vatRegistered', e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
          />
          <span className="text-sm text-stone-700">VAT-registered business</span>
        </label>
      </div>

      {/* ── Result ── */}
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 space-y-4">
        {preStart ? (
          <div className="text-sm text-stone-600">
            <p className="font-medium text-stone-800 mb-1">No levy yet for this date</p>
            <p>
              {council.label}&apos;s levy starts{' '}
              {new Date(council.liveFrom).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
              . Enter a check-in date on or after that date to see a calculation.
            </p>
          </div>
        ) : noRule || !result ? (
          <p className="text-sm text-stone-500">
            Fill in the form to see the levy calculation.
          </p>
        ) : (
          <>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-orange-700 mb-1">
                Estimated levy
              </p>
              <p className="text-5xl font-bold text-stone-900 tracking-tight">
                {pence(result.levyPence + result.vatOnLevyPence)}
              </p>
              {result.vatOnLevyPence > 0 && (
                <p className="text-xs text-stone-500 mt-1">
                  Incl. {pence(result.vatOnLevyPence)} VAT on levy
                </p>
              )}
            </div>

            <div className="border-t border-orange-200 pt-4 space-y-1.5 text-sm">
              <Row label="Nights in stay" value={String(result.working.totalNights)} />
              <Row
                label="Nights charged"
                value={
                  result.working.nightCapApplied
                    ? `${result.nightsCharged} (${result.working.nightCapValue}-night cap applied)`
                    : String(result.nightsCharged)
                }
              />
              {result.working.rateDescription && (
                <Row label="Rate" value={result.working.rateDescription} />
              )}
              {result.basePence > 0 && (
                <Row label="Levy base" value={pence(result.basePence)} />
              )}
              <Row label="Levy" value={pence(result.levyPence)} />
              {result.vatOnLevyPence > 0 && (
                <Row label="VAT on levy (20%)" value={pence(result.vatOnLevyPence)} />
              )}
              {result.retentionPence > 0 && (
                <Row
                  label="Host retention"
                  value={`−${pence(result.retentionPence)}`}
                  muted
                />
              )}
              <div className="border-t border-orange-200 pt-1.5">
                <Row
                  label="Net payable to council"
                  value={pence(result.levyPence + result.vatOnLevyPence - result.retentionPence)}
                  bold
                />
              </div>
            </div>

            {!hasLevy && (
              <p className="text-xs text-stone-500 pt-1">
                This booking returns £0 levy — check the steps below for the reason.
              </p>
            )}

            <details className="text-xs text-stone-500">
              <summary className="cursor-pointer hover:text-stone-700 select-none">
                Show calculation steps
              </summary>
              <ol className="mt-2 space-y-1 pl-4 list-decimal">
                {result.working.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </details>

            <a
              href="/account"
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
              onClick={() => {
                const g = typeof window !== 'undefined' && (window as Window & { gtag?: (...a: unknown[]) => void }).gtag
                if (g) g('event', 'calculator_cta_click', { council: inputs.council })
              }}
            >
              Sign up to file the return
              <span aria-hidden>→</span>
            </a>

            <div className="border-t border-orange-200 pt-4">
              {emailState === 'success' ? (
                <p className="text-xs text-green-700 font-medium">
                  ✓ Check your inbox — we&apos;ll remind you before the next deadline.
                </p>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-2">
                  <p className="text-xs text-stone-500">
                    Email me this result and a reminder before the next filing deadline.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="submit"
                      disabled={emailState === 'loading'}
                      className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 transition-colors"
                    >
                      {emailState === 'loading' ? '...' : 'Send'}
                    </button>
                  </div>
                  {emailState === 'error' && (
                    <p className="text-xs text-red-600">Something went wrong — please try again.</p>
                  )}
                  <p className="text-xs text-stone-400">
                    One email only.{' '}
                    <a href="/privacy" className="underline hover:text-stone-600">Privacy policy.</a>
                  </p>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  muted,
  bold,
}: {
  label: string
  value: string
  muted?: boolean
  bold?: boolean
}) {
  return (
    <div className={`flex justify-between gap-4 ${muted ? 'text-stone-400' : ''} ${bold ? 'font-semibold text-stone-800' : ''}`}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}
