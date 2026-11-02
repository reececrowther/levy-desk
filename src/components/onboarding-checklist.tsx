import Link from 'next/link'
import { db } from '@/lib/db'

interface Props {
  workspaceId: string
}

export async function OnboardingChecklist({ workspaceId }: Props) {
  const [propertyCount, bookingCount, returnCount] = await Promise.all([
    db.property.count({ where: { workspaceId } }),
    db.booking.count({ where: { property: { workspaceId } } }),
    db.levyReturn.count({ where: { workspaceId, status: { in: ['READY', 'FILED', 'PAID'] } } }),
  ])

  let activeExceptionCount = 0
  if (bookingCount > 0) {
    const calcsWithFlags = await db.calculation.findMany({
      where: {
        flags: { isEmpty: false },
        booking: { property: { workspaceId }, status: 'CONFIRMED' },
      },
      select: {
        flags: true,
        booking: { select: { acknowledgedFlags: true } },
      },
    })
    activeExceptionCount = calcsWithFlags.filter(({ flags, booking }) => {
      const acked = new Set(booking.acknowledgedFlags)
      return flags.some((f) => !acked.has(f))
    }).length
  }

  const hasProperty = propertyCount > 0
  const hasBookings = bookingCount > 0
  const exceptionsCleared = hasBookings && activeExceptionCount === 0
  const hasReturn = returnCount > 0

  const steps: Step[] = [
    {
      number: 1,
      label: 'Add your first property',
      detail: 'Tell Levy Desk which council your property is in so we can apply the right rules.',
      done: hasProperty,
      href: '/properties/new',
      cta: 'Add property',
      active: !hasProperty,
    },
    {
      number: 2,
      label: 'Import or add your bookings',
      detail: 'Upload a CSV export from Airbnb or Booking.com, or add bookings one by one.',
      done: hasBookings,
      href: hasProperty ? '/imports/new' : undefined,
      cta: 'Import bookings',
      active: hasProperty && !hasBookings,
    },
    {
      number: 3,
      label: 'Review any exceptions',
      detail: "We'll flag anything that needs a quick check before your return is ready to file.",
      done: exceptionsCleared,
      href: hasBookings ? '/exceptions' : undefined,
      cta: activeExceptionCount > 0
        ? `Review ${activeExceptionCount} exception${activeExceptionCount !== 1 ? 's' : ''}`
        : 'View exceptions',
      active: hasBookings && !exceptionsCleared,
      subtext: hasBookings && activeExceptionCount === 0
        ? 'No exceptions — all bookings are clean.'
        : undefined,
    },
    {
      number: 4,
      label: 'Generate your first return',
      detail: 'Download a ready-to-file return pack for the completed quarter.',
      done: hasReturn,
      href: exceptionsCleared ? '/returns' : undefined,
      cta: 'Generate return',
      active: exceptionsCleared && !hasReturn,
    },
  ]

  if (steps.every((s) => s.done)) return null

  const completedCount = steps.filter((s) => s.done).length

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-stone-900">Get started</h2>
          <p className="mt-0.5 text-xs text-stone-500">
            {completedCount} of {steps.length} steps complete
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-32 overflow-hidden rounded-full bg-orange-200 h-1.5">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <ol className="space-y-3">
        {steps.map((step) => (
          <StepRow key={step.number} step={step} />
        ))}
      </ol>
    </div>
  )
}

type Step = {
  number: number
  label: string
  detail: string
  done: boolean
  href?: string
  cta: string
  active: boolean
  subtext?: string
}

function StepRow({ step }: { step: Step }) {
  const inactive = !step.done && !step.active

  return (
    <li className={`flex items-start gap-3 ${inactive ? 'opacity-40' : ''}`}>
      {/* Icon */}
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
          step.done
            ? 'bg-green-500 text-white'
            : step.active
            ? 'bg-orange-500 text-white'
            : 'bg-stone-200 text-stone-500'
        }`}
      >
        {step.done ? '✓' : step.number}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${step.done ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
          {step.label}
        </p>
        {!step.done && (
          <p className="mt-0.5 text-xs text-stone-500">{step.subtext ?? step.detail}</p>
        )}
      </div>

      {/* CTA */}
      {step.active && step.href && (
        <Link
          href={step.href}
          className="shrink-0 rounded-md bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-700"
        >
          {step.cta}
        </Link>
      )}
    </li>
  )
}
