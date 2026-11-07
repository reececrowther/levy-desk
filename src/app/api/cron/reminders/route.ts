import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SCHEME_RULES } from '@/levy/rules'
import { parseQuarterKey, scotlandDeadline } from '@/lib/quarters'
import type { Quarter } from '@/lib/quarters'
import { sendDeadlineReminder, sendNilReturnReminder } from '@/lib/email/reminders'
import { bookingPeriodWhere } from '@/lib/return-period'

// Maps the deadline month back to the quarter it belongs to (Scotland only).
// Q1 → Apr 30, Q2 → Jul 31, Q3 → Oct 31, Q4 → Jan 31 (next year)
function scotlandQuarterForDeadline(date: Date): Quarter | null {
  const month = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()
  const map: Record<number, { q: number; y: number }> = {
    4:  { q: 1, y: year },
    7:  { q: 2, y: year },
    10: { q: 3, y: year },
    1:  { q: 4, y: year - 1 },
  }
  const entry = map[month]
  if (!entry) return null

  try {
    const quarter = parseQuarterKey(`${entry.y}-Q${entry.q}`)
    // Verify the deadline for this quarter matches the date we were given
    const expected = scotlandDeadline(quarter).toISOString().slice(0, 10)
    if (expected !== date.toISOString().slice(0, 10)) return null
    return quarter
  } catch {
    return null
  }
}

const REMINDER_DAYS = [14, 7] as const
const MS_PER_DAY = 24 * 60 * 60 * 1000

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorised', { status: 401 })
  }

  // Live Scotland councils only — Cardiff goes live April 2027, no deadline reminders yet
  const liveCouncils = [
    ...new Set(
      SCHEME_RULES
        .filter((r) => r.status === 'live' && r.enabled && r.country === 'scotland')
        .map((r) => r.council),
    ),
  ]

  const todayUtc = new Date()
  todayUtc.setUTCHours(0, 0, 0, 0)

  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const council of liveCouncils) {
    for (const daysAhead of REMINDER_DAYS) {
      const targetDate = new Date(todayUtc.getTime() + daysAhead * MS_PER_DAY)
      const quarter = scotlandQuarterForDeadline(targetDate)
      if (!quarter) continue // today is not a reminder day for this council

      // Find all workspaces that have at least one property in this council
      const workspaces = await db.workspace.findMany({
        where: { properties: { some: { council } } },
        include: {
          members: {
            where: { role: { in: ['OWNER', 'ADMIN'] } },
            include: { user: { select: { email: true } } },
          },
        },
      })

      for (const workspace of workspaces) {
        const bookingCount = await db.booking.count({
          where: {
            property: { workspaceId: workspace.id, council },
            ...bookingPeriodWhere(council, quarter.periodStart, quarter.periodEnd),
            status: 'CONFIRMED',
          },
        })

        const type = `${bookingCount > 0 ? 'DEADLINE' : 'NIL'}_${daysAhead}`

        // Idempotency — skip if already sent this reminder
        const alreadySent = await db.reminderLog.findUnique({
          where: {
            workspaceId_council_quarterKey_type: {
              workspaceId: workspace.id,
              council,
              quarterKey: quarter.key,
              type,
            },
          },
        })

        if (alreadySent) {
          skipped++
          continue
        }

        const ownerEmails = workspace.members.map((m) => m.user.email)
        if (ownerEmails.length === 0) {
          skipped++
          continue
        }

        const deadline = scotlandDeadline(quarter)

        let sendError: string | null = null
        for (const email of ownerEmails) {
          try {
            if (bookingCount > 0) {
              await sendDeadlineReminder({
                toEmail: email,
                workspaceName: workspace.name,
                council,
                quarter,
                deadline,
                bookingCount,
                daysUntil: daysAhead,
              })
            } else {
              await sendNilReturnReminder({
                toEmail: email,
                workspaceName: workspace.name,
                council,
                quarter,
                deadline,
              })
            }
          } catch (e) {
            sendError = `${workspace.id}/${council}/${email}: ${e instanceof Error ? e.message : String(e)}`
            errors.push(sendError)
          }
        }

        if (!sendError) {
          try {
            await db.reminderLog.create({
              data: {
                workspaceId: workspace.id,
                council,
                quarterKey: quarter.key,
                type,
              },
            })
            sent++
          } catch (e) {
            errors.push(
              `${workspace.id}/${council} log: ${e instanceof Error ? e.message : String(e)}`,
            )
          }
        }
      }
    }
  }

  return NextResponse.json({ sent, skipped, errors })
}
