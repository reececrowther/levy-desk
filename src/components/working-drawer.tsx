'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPence } from '@/lib/format'
import type { Calculation } from '@prisma/client'

const FLAG_LABELS: Record<string, string> = {
  AMBIGUITY_EDINBURGH_CAP_START: 'Edinburgh cap ambiguity',
  COMMISSION_UNKNOWN: 'Commission unknown',
  BOOKING_COM_DOUBLE_REMIT: 'Booking.com — confirm remittance',
  BASE_IS_PAYOUT_NOT_GROSS: 'Base is payout, not gross',
  WELSH_GUEST_COUNT_MISSING: 'Welsh guest count missing',
  BOOKING_PRE_ACCOUNTING_DATE: 'Booked before accounting date',
  WELSH_PROPERTY_UNREGISTERED: 'Welsh property unregistered',
  VAT_THRESHOLD_WARNING: 'Near VAT threshold',
  HIGHLAND_PROPOSED: 'Highland scheme — proposed only',
  UNVERIFIED_START_DATE: 'Scheme start date unverified',
}

interface Props {
  calculation: Calculation
}

export function WorkingDrawer({ calculation }: Props) {
  const working = calculation.working as Record<string, unknown>
  const steps = (working['steps'] as string[]) ?? []

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          Show working
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Calculation working</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Flags */}
          {calculation.flags.length > 0 && (
            <div>
              <p className="mb-2 font-medium text-amber-700">Flags requiring review</p>
              <div className="flex flex-wrap gap-1">
                {calculation.flags.map((f) => (
                  <Badge key={f} variant="warning">
                    {FLAG_LABELS[f] ?? f}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Key figures */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 rounded-lg bg-stone-50 p-3">
            <Row label="Rule version" value={calculation.schemeRuleId} />
            <Row label="Total nights" value={String(working['totalNights'] ?? '—')} />
            <Row label="Nights charged" value={String(calculation.nightsCharged)} />
            <Row label="Base" value={formatPence(calculation.basePence)} />
            <Row label="Exclusions" value={formatPence(calculation.exclusionsPence)} />
            <Row label="Levy" value={formatPence(calculation.levyPence)} />
            {calculation.vatOnLevyPence > 0 && (
              <Row label="VAT on levy" value={formatPence(calculation.vatOnLevyPence)} />
            )}
            {calculation.retentionPence > 0 && (
              <Row label="Retention (kept)" value={formatPence(calculation.retentionPence)} />
            )}
          </div>

          <Separator />

          {/* Step-by-step working */}
          <div>
            <p className="mb-2 font-medium">Step-by-step</p>
            <ol className="space-y-1 text-stone-600">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 font-mono text-stone-400">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-stone-500">{label}</span>
      <span className="font-mono">{value}</span>
    </>
  )
}
