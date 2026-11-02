import nodemailer from 'nodemailer'
import type { Quarter } from '@/lib/quarters'
import { formatQuarterPeriod } from '@/lib/quarters'

function councilLabel(slug: string): string {
  const MAP: Record<string, string> = {
    edinburgh: 'City of Edinburgh Council',
    glasgow: 'Glasgow City Council',
    aberdeen: 'Aberdeen City Council',
    stirling: 'Stirling Council',
    west_dunbartonshire: 'West Dunbartonshire Council',
    highland: 'Highland Council',
    cardiff: 'Cardiff Council',
  }
  return MAP[slug] ?? slug.replace(/_/g, ' ')
}

export type NilReturnReminderInput = {
  toEmail: string
  workspaceName: string
  council: string
  quarter: Quarter
  deadline: Date
}

export async function sendNilReturnReminder(input: NilReturnReminderInput): Promise<void> {
  if (!process.env.EMAIL_SERVER) return

  const transport = nodemailer.createTransport(process.env.EMAIL_SERVER)
  const council = councilLabel(input.council)
  const period = formatQuarterPeriod(input.quarter)
  const deadlineStr = input.deadline.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const subject = `Nil return reminder — ${council} ${input.quarter.label}`

  const text = [
    `Hello,`,
    ``,
    `This is a reminder that a visitor levy return is due for:`,
    ``,
    `  Council:  ${council}`,
    `  Period:   ${input.quarter.label} (${period})`,
    `  Deadline: ${deadlineStr}`,
    `  Workspace: ${input.workspaceName}`,
    ``,
    `You have no confirmed bookings for this council in this period. You are`,
    `still required to file a nil return with ${council}.`,
    ``,
    `Log in to Levy Desk to generate and download your nil-return pack.`,
    ``,
    `Levy Desk does not file returns or make payments on your behalf.`,
  ].join('\n')

  const html = `
    <p>Hello,</p>
    <p>This is a reminder that a visitor levy return is due for:</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:4px 16px 4px 0;color:#718096">Council</td><td style="font-weight:600">${council}</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#718096">Period</td><td>${input.quarter.label} (${period})</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#718096">Deadline</td><td style="font-weight:600;color:#dc2626">${deadlineStr}</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#718096">Workspace</td><td>${input.workspaceName}</td></tr>
    </table>
    <p>You have <strong>no confirmed bookings</strong> for this council in this period.
    You are still required to file a <strong>nil return</strong> with ${council}.</p>
    <p>Log in to Levy Desk to generate and download your nil-return pack.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="font-size:12px;color:#a0aec0">
      Levy Desk does not file returns or make payments on your behalf.
    </p>
  `

  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? 'Levy Desk <noreply@levydesk.local>',
    to: input.toEmail,
    subject,
    text,
    html,
  })
}

export type DeadlineReminderInput = {
  toEmail: string
  workspaceName: string
  council: string
  quarter: Quarter
  deadline: Date
  bookingCount: number
  daysUntil: number
}

export async function sendDeadlineReminder(input: DeadlineReminderInput): Promise<void> {
  if (!process.env.EMAIL_SERVER) return

  const transport = nodemailer.createTransport(process.env.EMAIL_SERVER)
  const council = councilLabel(input.council)
  const period = formatQuarterPeriod(input.quarter)
  const appUrl = process.env.NEXTAUTH_URL ?? 'https://levydesk.co.uk'
  const deadlineStr = input.deadline.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  const urgency = input.daysUntil <= 7 ? 'urgent ' : ''
  const subject = `${urgency}Visitor levy return due in ${input.daysUntil} days — ${council} ${input.quarter.label}`

  const bookingStr = `${input.bookingCount} confirmed booking${input.bookingCount !== 1 ? 's' : ''}`

  const text = [
    `Hello,`,
    ``,
    `Your visitor levy return for ${council} is due in ${input.daysUntil} days.`,
    ``,
    `  Council:  ${council}`,
    `  Period:   ${input.quarter.label} (${period})`,
    `  Deadline: ${deadlineStr}`,
    `  Bookings: ${bookingStr} this quarter`,
    `  Workspace: ${input.workspaceName}`,
    ``,
    `Log in to Levy Desk to generate and download your return pack:`,
    `${appUrl}/returns`,
    ``,
    `Levy Desk does not file returns or make payments on your behalf.`,
  ].join('\n')

  const html = `
    <p>Hello,</p>
    <p>Your visitor levy return for <strong>${council}</strong> is due in <strong>${input.daysUntil} days</strong>.</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:4px 16px 4px 0;color:#718096">Council</td><td style="font-weight:600">${council}</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#718096">Period</td><td>${input.quarter.label} (${period})</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#718096">Deadline</td><td style="font-weight:600;color:#dc2626">${deadlineStr}</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#718096">Bookings</td><td>${bookingStr} this quarter</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#718096">Workspace</td><td>${input.workspaceName}</td></tr>
    </table>
    <p style="margin:24px 0">
      <a href="${appUrl}/returns"
         style="display:inline-block;background:#ea580c;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
        Generate your return →
      </a>
    </p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="font-size:12px;color:#a0aec0">
      Levy Desk does not file returns or make payments on your behalf.
    </p>
  `

  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? 'Levy Desk <noreply@levydesk.local>',
    to: input.toEmail,
    subject,
    text,
    html,
  })
}
