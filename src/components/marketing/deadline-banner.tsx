export function DeadlineBanner() {
  const today = new Date().toISOString().slice(0, 10)
  if (today !== '2026-10-30' && today !== '2026-10-31') return null

  const isDueToday = today === '2026-10-31'

  return (
    <div className="bg-red-600 px-4 py-3 text-center text-sm font-medium text-white">
      {isDueToday ? (
        <>
          The Q3 2026 Edinburgh visitor levy return is{' '}
          <strong>due today — file before midnight.</strong>{' '}
          <a
            href="https://www.visitorlevy.scot"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-red-100"
          >
            File at visitorlevy.scot ↗
          </a>
        </>
      ) : (
        <>
          The Q3 2026 Edinburgh visitor levy return is due{' '}
          <strong>tomorrow — 31 October 2026.</strong>{' '}
          <a
            href="/edinburgh-visitor-levy/how-to-file"
            className="underline hover:text-red-100"
          >
            Filing guide →
          </a>
        </>
      )}
    </div>
  )
}
