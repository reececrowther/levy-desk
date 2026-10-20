'use client'

import { useTransition } from 'react'
import { lockReturn, unlockReturn, sendNilReminder } from '@/server/actions/returns'

type Props = {
  returnId: string
  isLocked: boolean
  isNilReturn: boolean
  status: string
}

export function ReturnActions({ returnId, isLocked, isNilReturn, status }: Props) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-wrap gap-2">
      {/* Download CSV */}
      <a
        href={`/api/returns/${returnId}/csv`}
        className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
      >
        Download CSV
      </a>

      {/* Download PDF */}
      <a
        href={`/api/returns/${returnId}/pdf`}
        className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
      >
        Download PDF
      </a>

      {/* Owner statement CSV */}
      <a
        href={`/api/returns/${returnId}/statement`}
        className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
      >
        Owner statement
      </a>

      {/* Lock / unlock */}
      {!isLocked && (status === 'DRAFT' || status === 'READY') && (
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await lockReturn(returnId)
            })
          }
          className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {pending ? 'Locking…' : 'Lock return'}
        </button>
      )}

      {isLocked && status !== 'FILED' && status !== 'PAID' && (
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await unlockReturn(returnId)
            })
          }
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          {pending ? 'Unlocking…' : 'Unlock (create amendment)'}
        </button>
      )}

      {/* Nil-return email reminder */}
      {isNilReturn && (
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await sendNilReminder(returnId)
              alert('Nil-return reminder email sent.')
            })
          }
          className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100 disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Email nil-return reminder'}
        </button>
      )}
    </div>
  )
}
