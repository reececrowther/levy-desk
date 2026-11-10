'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

// Guards against double-firing (React dev mode runs effects twice).
const fired = new Set<string>()

/**
 * Fires a GA4 event once when `?track=<event>` is in the URL, then removes the
 * param so a refresh doesn't count twice. Server actions add the param to their
 * redirect, e.g. redirect('/dashboard?track=sign_up&ev_workspace_type=AGENT').
 * Any other `?ev_*` params are sent as event parameters (without the prefix).
 */
export function TrackEvent() {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const event = params.get('track')
    if (!event) return
    const firedKey = `${pathname}?${params.toString()}`
    if (fired.has(firedKey)) return
    fired.add(firedKey)
    const eventParams: Record<string, string> = {}
    params.forEach((value, key) => {
      if (key.startsWith('ev_')) eventParams[key.slice(3)] = value
    })
    const g = (window as Window & { gtag?: (...a: unknown[]) => void }).gtag
    if (g) g('event', event, eventParams)

    const rest = new URLSearchParams(params.toString())
    rest.delete('track')
    for (const key of Object.keys(eventParams)) rest.delete(`ev_${key}`)
    const qs = rest.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [params, pathname, router])

  return null
}
