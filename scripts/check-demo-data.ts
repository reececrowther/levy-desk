import { readFileSync, readdirSync } from 'node:fs'
import Papa from 'papaparse'
import { validateRow } from '../src/lib/importers/validator'
import { AIRBNB_PRESET, BOOKING_COM_PRESET } from '../src/lib/importers/presets'

const dir = 'docs/demo-data'
for (const f of readdirSync(dir).filter((x) => x.endsWith('.csv'))) {
  const mapping = f.includes('airbnb') ? AIRBNB_PRESET : BOOKING_COM_PRESET
  const council = f.includes('glasgow') ? 'glasgow' : 'edinburgh'
  const rows = Papa.parse<Record<string, string>>(readFileSync(`${dir}/${f}`, 'utf8').trim(), { header: true, skipEmptyLines: true }).data
  let ok = 0
  const statuses: Record<string, number> = {}
  for (const r of rows) {
    const m: Record<string, string> = {}
    for (const [t, h] of Object.entries(mapping)) { const v = h ? r[h] : undefined; if (v !== undefined) m[t] = v }
    const v = validateRow(m, council, 'SCOTLAND')
    if (v.ok) { ok++; statuses[v.data.status] = (statuses[v.data.status] ?? 0) + 1 }
    else console.log('  ERROR', f, r[mapping.externalRef ?? ''], v.errors)
  }
  console.log(f, `${ok}/${rows.length} valid`, statuses)
}
