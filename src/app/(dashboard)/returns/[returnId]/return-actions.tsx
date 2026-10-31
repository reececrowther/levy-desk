'use client'

import { useState, useTransition } from 'react'
import { lockReturn, unlockReturn, sendNilReminder, markReturnFiled, markReturnPaid } from '@/server/actions/returns'

type Props = {
  returnId: string
  isLocked: boolean
  isNilReturn: boolean
  status: string
  filedRef?: string | null
}

export function ReturnActions({ returnId, isLocked, isNilReturn, status, filedRef }: Props) {
  const [pending, startTransition] = useTransition()
  const [showFilingForm, setShowFilingForm] = useState(false)
  const [refInput, setRefInput] = useState(filedRef ?? '')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  function handleFiled() {
    startTransition(async () => {
      await markReturnFiled(returnId, refInput.trim() || undefined)
      setShowFilingForm(false)
      setSuccessMsg('Return marked as filed.')
    })
  }

  return (
    <div className="space-y-3">
      {successMsg && (
        <p className="text-sm text-green-700 font-medium">{successMsg}</p>
      )}

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

        {/* Lock */}
        {!isLocked && (status === 'DRAFT' || status === 'READY') && (
          <button
            disabled={pending}
            onClick={() => startTransition(async () => { await lockReturn(returnId) })}
            className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Lock return'}
          </button>
        )}

        {/* Unlock */}
        {isLocked && status !== 'FILED' && status !== 'PAID' && (
          <button
            disabled={pending}
            onClick={() => startTransition(async () => { await unlockReturn(returnId) })}
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Unlock (create amendment)'}
          </button>
        )}

        {/* Mark as filed */}
        {isLocked && status === 'READY' && !showFilingForm && (
          <button
            onClick={() => setShowFilingForm(true)}
            className="rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-sm text-green-800 hover:bg-green-100"
          >
            Mark as filed →
          </button>
        )}

        {/* Mark as paid */}
        {status === 'FILED' && (
          <button
            disabled={pending}
            onClick={() => startTransition(async () => {
              await markReturnPaid(returnId)
              setSuccessMsg('Return marked as paid.')
            })}
            className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm text-blue-800 hover:bg-blue-100 disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Mark as paid'}
          </button>
        )}

        {/* Nil-return email reminder */}
        {isNilReturn && (
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await sendNilReminder(returnId)
                setSuccessMsg('Nil-return reminder email sent.')
              })
            }
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100 disabled:opacity-50"
          >
            {pending ? 'Sending…' : 'Email nil-return reminder'}
          </button>
        )}
      </div>

      {/* Inline filing form */}
      {showFilingForm && (
        <div className="flex items-end gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-green-900">
              Council reference number (optional)
            </label>
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="e.g. EVL-2026-Q3-001234"
              className="w-full rounded-md border border-green-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <p className="mt-1 text-xs text-green-700">
              The reference number assigned by the council when you file. Leave blank if not provided.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              disabled={pending}
              onClick={handleFiled}
              className="rounded-md bg-green-700 px-3 py-1.5 text-sm text-white hover:bg-green-800 disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Confirm filed'}
            </button>
            <button
              onClick={() => setShowFilingForm(false)}
              className="rounded-md border border-green-300 px-3 py-1.5 text-sm text-green-800 hover:bg-green-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filed ref display */}
      {(status === 'FILED' || status === 'PAID') && filedRef && (
        <p className="text-xs text-stone-500">
          Council reference: <span className="font-mono font-medium text-stone-700">{filedRef}</span>
        </p>
      )}
    </div>
  )
}
