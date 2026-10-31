'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { uploadFile } from '@/server/actions/imports'
import type { UploadState } from '@/server/actions/imports'

const INITIAL: UploadState = {}

const SOURCES = [
  { value: 'AIRBNB', label: 'Airbnb' },
  { value: 'BOOKING_COM', label: 'Booking.com' },
  { value: 'VRBO', label: 'VRBO / HomeAway' },
  { value: 'DIRECT', label: 'Direct booking' },
  { value: 'SOFTWARE', label: 'Property management software' },
  { value: 'OTHER', label: 'Other' },
]

interface Props {
  properties: { id: string; name: string }[]
}

export function NewImportForm({ properties }: Props) {
  const [state, action, pending] = useActionState(uploadFile, INITIAL)

  return (
    <form action={action} encType="multipart/form-data" className="space-y-5">
      {state.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="propertyId" className="mb-1 block text-sm font-medium text-stone-700">
          Property
        </label>
        {properties.length === 0 ? (
          <p className="text-sm text-stone-500">
            No properties found.{' '}
            <Link href="/properties/new" className="underline">
              Add one first.
            </Link>
          </p>
        ) : (
          <select
            id="propertyId"
            name="propertyId"
            required
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            <option value="">Select property…</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label htmlFor="source" className="mb-1 block text-sm font-medium text-stone-700">
          Booking source
        </label>
        <select
          id="source"
          name="source"
          required
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <option value="">Select source…</option>
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="file" className="mb-1 block text-sm font-medium text-stone-700">
          File
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".csv,.xlsx,.xls"
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <p className="mt-1 text-xs text-stone-400">CSV or Excel up to 5 MB</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-stone-900 py-2 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {pending ? 'Uploading…' : 'Upload and map columns →'}
      </button>
    </form>
  )
}
