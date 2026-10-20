'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { processImport } from '@/server/actions/imports'
import {
  TARGET_FIELDS,
  TARGET_FIELD_LABELS,
  REQUIRED_TARGET_FIELDS,
  PRESETS,
} from '@/lib/importers/presets'
import type { ProcessState } from '@/server/actions/imports'
import type { TargetField } from '@/lib/importers/presets'

type Props = {
  batchId: string
  source: string
  filename: string
  propertyName: string
  headers: string[]
}

const INITIAL: ProcessState = {}

export function MapForm({ batchId, source, filename, propertyName, headers }: Props) {
  const [actionState, action, pending] = useActionState(processImport, INITIAL)
  const [saveMapping, setSaveMapping] = useState(false)

  const preset = PRESETS[source]?.mapping ?? {}

  function defaultFor(field: TargetField): string {
    const presetHeader = preset[field]
    if (presetHeader && headers.includes(presetHeader)) return presetHeader
    return ''
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link href="/imports" className="text-sm text-stone-500 hover:text-stone-700">
          ← Imports
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Map columns</h1>
        <p className="mt-1 text-sm text-stone-500">
          <span className="font-medium">{filename}</span> for {propertyName}
        </p>
        {source === 'BOOKING_COM' && (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Booking.com bookings will be flagged with <strong>BOOKING_COM_DOUBLE_REMIT</strong> — check
            whether Booking.com has already collected the levy in your area before filing.
          </p>
        )}
      </div>

      <form action={action} className="space-y-6">
        {actionState.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionState.error}
          </p>
        )}

        <input type="hidden" name="batchId" value={batchId} />

        <div className="rounded-lg border border-stone-200">
          <div className="border-b border-stone-200 bg-stone-50 px-4 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Column mapping — {source === 'AIRBNB' || source === 'BOOKING_COM'
                ? 'preset applied automatically'
                : 'select each column'}
            </p>
          </div>
          <div className="divide-y divide-stone-100">
            {TARGET_FIELDS.map((field) => {
              const required = REQUIRED_TARGET_FIELDS.includes(field)
              return (
                <div key={field} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-48 shrink-0">
                    <span className="text-sm text-stone-700">{TARGET_FIELD_LABELS[field]}</span>
                    {required && <span className="ml-1 text-xs text-red-500">*</span>}
                  </div>
                  <select
                    name={`field_${field}`}
                    defaultValue={defaultFor(field)}
                    className="flex-1 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                  >
                    <option value="">(not in file)</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 px-4 py-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={saveMapping}
              onChange={(e) => setSaveMapping(e.target.checked)}
            />
            Save this mapping for future {source} imports
          </label>
          {saveMapping && (
            <input
              name="saveMappingName"
              type="text"
              placeholder={`e.g. ${source === 'AIRBNB' ? 'Airbnb default' : 'Booking.com 2026'}`}
              className="mt-2 w-full rounded-md border border-stone-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-stone-900 py-2 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {pending ? 'Importing…' : 'Import bookings →'}
        </button>
      </form>
    </div>
  )
}
