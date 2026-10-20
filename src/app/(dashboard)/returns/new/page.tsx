'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { generateReturn } from '@/server/actions/returns'
import { availableQuarters } from '@/lib/quarters'
import type { GenerateState } from '@/server/actions/returns'

const COUNCILS = [
  { value: 'edinburgh', label: 'City of Edinburgh', earliest: '2026-07-24' },
  { value: 'glasgow', label: 'Glasgow', earliest: '2027-01-01' },
  { value: 'aberdeen', label: 'Aberdeen', earliest: '2027-04-01' },
  { value: 'stirling', label: 'Stirling', earliest: '2027-06-01' },
  { value: 'west_dunbartonshire', label: 'West Dunbartonshire', earliest: '2027-07-01' },
  { value: 'cardiff', label: 'Cardiff', earliest: '2027-04-01' },
] as const

const INITIAL: GenerateState = {}

export default function NewReturnPage() {
  const [state, action, pending] = useActionState(generateReturn, INITIAL)

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-6">
        <Link href="/returns" className="text-sm text-stone-500 hover:text-stone-700">
          ← Returns
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Generate return</h1>
        <p className="mt-1 text-sm text-stone-500">
          Generates a return pack for a specific council and quarter. Any existing return for the
          same period will be opened instead of a new one being created.
        </p>
      </div>

      <form action={action} className="space-y-5">
        {state.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="council" className="mb-1 block text-sm font-medium text-stone-700">
            Council
          </label>
          <select
            id="council"
            name="council"
            required
            onChange={(e) => {
              const earliest = COUNCILS.find((c) => c.value === e.target.value)?.earliest ?? '2026-01-01'
              const qs = document.getElementById('quarterKey') as HTMLSelectElement
              if (!qs) return
              // Re-populate quarter options
              const quarters = availableQuarters(earliest)
              qs.innerHTML = quarters
                .map((q) => `<option value="${q.key}">${q.label}</option>`)
                .join('')
            }}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            <option value="">Select council…</option>
            {COUNCILS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quarterKey" className="mb-1 block text-sm font-medium text-stone-700">
            Quarter
          </label>
          <select
            id="quarterKey"
            name="quarterKey"
            required
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            <option value="">Select council first…</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-stone-900 py-2 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {pending ? 'Generating…' : 'Generate return'}
        </button>
      </form>
    </div>
  )
}
