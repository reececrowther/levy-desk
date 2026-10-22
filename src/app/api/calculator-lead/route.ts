import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sendCalculatorLeadEmail } from '@/lib/email/calculator-lead'

const VALID_COUNCILS = [
  'edinburgh', 'glasgow', 'aberdeen', 'stirling',
  'west_dunbartonshire', 'cardiff',
] as const

const schema = z.object({
  email: z.string().email(),
  council: z.enum(VALID_COUNCILS),
  levyPence: z.number().int().min(0),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 422 })
  }

  const { email, council, levyPence } = parsed.data

  await db.calculatorLead.upsert({
    where: { email_council: { email, council } },
    create: { email, council, levyPence },
    update: { levyPence, consentAt: new Date() },
  })

  // Best-effort email — don't fail the response if sending fails
  try {
    await sendCalculatorLeadEmail({ toEmail: email, council, levyPence })
    await db.calculatorLead.update({
      where: { email_council: { email, council } },
      data: { emailedAt: new Date() },
    })
  } catch (err) {
    console.error('[calculator-lead] email send failed:', err)
  }

  return NextResponse.json({ ok: true })
}
