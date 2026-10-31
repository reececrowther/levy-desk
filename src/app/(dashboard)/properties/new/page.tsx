'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProperty, lookupPropertyPostcode } from '@/server/actions/properties'

const COUNCILS = [
  { value: 'edinburgh', label: 'Edinburgh' },
  { value: 'glasgow', label: 'Glasgow' },
  { value: 'aberdeen', label: 'Aberdeen' },
  { value: 'stirling', label: 'Stirling' },
  { value: 'west_dunbartonshire', label: 'West Dunbartonshire' },
  { value: 'cardiff', label: 'Cardiff' },
]

export default function NewPropertyPage() {
  const router = useRouter()
  const [lookingUp, setLookingUp] = useState(false)
  const [councilHint, setCouncilHint] = useState<string | null>(null)
  const [council, setCouncil] = useState('')
  const [country, setCountry] = useState<'SCOTLAND' | 'WALES' | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handlePostcodeLookup(postcode: string) {
    if (!postcode || postcode.length < 5) return
    setLookingUp(true)
    try {
      const result = await lookupPropertyPostcode(postcode)
      if (result.council) {
        setCouncil(result.council)
        setCouncilHint(`Auto-detected: ${result.adminDistrict}`)
      } else {
        setCouncilHint(result.adminDistrict ? `${result.adminDistrict} — not a levy council area` : 'Postcode not found')
      }
      if (result.country === 'Scotland') setCountry('SCOTLAND')
      else if (result.country === 'Wales') setCountry('WALES')
    } finally {
      setLookingUp(false)
    }
  }

  async function handleSubmit(fd: FormData) {
    setError(null)
    setSubmitting(true)
    try {
      await createProperty({
        name: fd.get('name') as string,
        addressLine1: (fd.get('addressLine1') as string) || undefined,
        town: (fd.get('town') as string) || undefined,
        postcode: fd.get('postcode') as string,
        council: fd.get('council') as string,
        country: fd.get('country') as 'SCOTLAND' | 'WALES',
        accommodationType: fd.get('accommodationType') as 'BNB_GUEST_HOUSE' | 'CAMPSITE' | 'HOSTEL_DORM' | 'HOTEL' | 'OTHER' | 'SELF_CATERING',
        unitsOrRooms: Number(fd.get('unitsOrRooms')),
        licenceNumber: (fd.get('licenceNumber') as string) || undefined,
        welshRegisterNumber: (fd.get('welshRegisterNumber') as string) || undefined,
        breakfastIncluded: fd.get('breakfastIncluded') === 'true',
        breakfastRetailValuePence: fd.get('breakfastRetailValuePence')
          ? Number(fd.get('breakfastRetailValuePence'))
          : undefined,
      })
      router.push('/properties')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-lg space-y-6">
      <h1 className="text-lg font-semibold">Add property</h1>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">

        <Field id="name" label="Property name">
          <Input id="name" name="name" placeholder="Sea View Cottage" required />
        </Field>

        <Field id="addressLine1" label="Address (optional)">
          <Input id="addressLine1" name="addressLine1" />
        </Field>

        <Field id="town" label="Town (optional)">
          <Input id="town" name="town" />
        </Field>

        <div className="space-y-1.5">
          <Label htmlFor="postcode">Postcode</Label>
          <div className="flex gap-2">
            <Input
              id="postcode"
              name="postcode"
              placeholder="EH1 1AB"
              required
              className="flex-1"
              onBlur={(e) => handlePostcodeLookup(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={lookingUp}
              onClick={() => {
                const el = document.getElementById('postcode') as HTMLInputElement
                handlePostcodeLookup(el?.value ?? '')
              }}
            >
              {lookingUp ? '…' : 'Look up'}
            </Button>
          </div>
          {councilHint && (
            <p className="text-xs text-stone-500">{councilHint}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="council">Council</Label>
          <select
            id="council"
            name="council"
            value={council}
            onChange={(e) => setCouncil(e.target.value)}
            required
            className="flex h-9 w-full rounded-md border border-stone-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
          >
            <option value="">Select council</option>
            {COUNCILS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <select
            id="country"
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value as 'SCOTLAND' | 'WALES')}
            required
            className="flex h-9 w-full rounded-md border border-stone-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
          >
            <option value="">Select country</option>
            <option value="SCOTLAND">Scotland</option>
            <option value="WALES">Wales</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="accommodationType">Accommodation type</Label>
          <select
            id="accommodationType"
            name="accommodationType"
            required
            className="flex h-9 w-full rounded-md border border-stone-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
          >
            <option value="">Select type</option>
            <option value="SELF_CATERING">Self-catering</option>
            <option value="BNB_GUEST_HOUSE">B&amp;B / Guest house</option>
            <option value="HOTEL">Hotel</option>
            <option value="HOSTEL_DORM">Hostel dormitory</option>
            <option value="CAMPSITE">Campsite</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <Field id="unitsOrRooms" label="Number of units / rooms">
          <Input id="unitsOrRooms" name="unitsOrRooms" type="number" min="1" defaultValue="1" required />
        </Field>

        <Field id="licenceNumber" label="Short-term let licence number (Scotland, optional)">
          <Input id="licenceNumber" name="licenceNumber" placeholder="STL-..." />
        </Field>

        <Field id="welshRegisterNumber" label="Welsh register number (Wales, if applicable)">
          <Input id="welshRegisterNumber" name="welshRegisterNumber" placeholder="WR-..." />
        </Field>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="breakfastIncluded" name="breakfastIncluded" value="true" />
            <Label htmlFor="breakfastIncluded" className="font-normal">
              Breakfast included in room price
            </Label>
          </div>
        </div>

        <Field id="breakfastRetailValuePence" label="Breakfast retail value (pence per night, if included)">
          <Input
            id="breakfastRetailValuePence"
            name="breakfastRetailValuePence"
            type="number"
            min="0"
            placeholder="e.g. 1500 for £15"
          />
        </Field>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save property'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
