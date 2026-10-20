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

export default function NewImportPage() {
  const [state, action, pending] = useActionState(uploadFile, INITIAL)

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-6">
        <Link href="/imports" className="text-sm text-stone-500 hover:text-stone-700">
          ← Imports
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Upload bookings file</h1>
        <p className="mt-1 text-sm text-stone-500">
          Accepts CSV or Excel (.xlsx) exports from Airbnb, Booking.com, and other platforms.
        </p>
      </div>

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
          <PropertySelect />
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
            <option value="">Select source...</option>
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
    </div>
  )
}

// Property selector — in a real app this would be a server component or use SWR.
// For now it is a placeholder that reads from a server-rendered select populated
// via the parent layout's data. Since this is a client component we fetch via a
// small server action or a dedicated API. For simplicity we render a text input.
function PropertySelect() {
  return (
    <div>
      <input
        id="propertyId"
        name="propertyId"
        type="text"
        required
        placeholder="Property ID (cuid)"
        className="w-full rounded-md border border-stone-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
      />
      <p className="mt-1 text-xs text-stone-400">
        Copy the property ID from the{' '}
        <Link href="/properties" className="underline">
          Properties page
        </Link>
        .
      </p>
    </div>
  )
}
