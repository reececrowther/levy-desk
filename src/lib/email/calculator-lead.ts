import nodemailer from 'nodemailer'

const COUNCIL_LABELS: Record<string, string> = {
  edinburgh: 'Edinburgh',
  glasgow: 'Glasgow',
  aberdeen: 'Aberdeen',
  stirling: 'Stirling',
  west_dunbartonshire: 'West Dunbartonshire',
  cardiff: 'Cardiff',
}

const GUIDE_PATHS: Record<string, string> = {
  edinburgh: '/edinburgh-visitor-levy/how-to-file',
  glasgow: '/glasgow-visitor-levy',
  cardiff: '/cardiff-tourism-levy',
}

// Returns the next quarterly filing deadline for a council from a given date.
// Scotland and Wales both follow the calendar-quarter + 1 month pattern.
function nextDeadline(council: string, from: Date): Date {
  const m = from.getMonth() // 0-indexed
  const y = from.getFullYear()

  // Quarter end months: Mar (2), Jun (5), Sep (8), Dec (11)
  // Deadline: last day of the following month
  if (m <= 2) return new Date(y, 3, 30)       // Q1 → 30 Apr
  if (m <= 5) return new Date(y, 6, 31)       // Q2 → 31 Jul
  if (m <= 8) return new Date(y, 9, 31)       // Q3 → 31 Oct
  return new Date(y + 1, 0, 31)              // Q4 → 31 Jan next year
}

function pence(n: number): string {
  return `£${(n / 100).toFixed(2)}`
}

export async function sendCalculatorLeadEmail(params: {
  toEmail: string
  council: string
  levyPence: number
}): Promise<void> {
  if (!process.env.EMAIL_SERVER) {
    console.warn('[calculator-lead] EMAIL_SERVER not configured — skipping email send')
    return
  }

  const transport = nodemailer.createTransport(process.env.EMAIL_SERVER)
  const councilLabel = COUNCIL_LABELS[params.council] ?? params.council
  const deadline = nextDeadline(params.council, new Date())
  const deadlineStr = deadline.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const guidePath = GUIDE_PATHS[params.council]
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.levydesk.co.uk'
  const guideUrl = guidePath ? `${baseUrl}${guidePath}` : `${baseUrl}/edinburgh-visitor-levy`

  const subject = `Your ${councilLabel} levy estimate — next return due ${deadlineStr}`

  const text = [
    `Your estimated ${councilLabel} visitor levy`,
    ``,
    `  Estimated levy: ${pence(params.levyPence)}`,
    `  Council: ${councilLabel}`,
    `  Next filing deadline: ${deadlineStr}`,
    ``,
    `This is an estimate based on the details you entered in the Levy Desk`,
    `calculator. The actual levy for your return will depend on all bookings`,
    `for the quarter.`,
    ``,
    `How to file your return:`,
    guideUrl,
    ``,
    `File your return with Levy Desk — import your bookings and produce a`,
    `ready-to-file return pack in minutes:`,
    `${baseUrl}/account`,
    ``,
    `─`,
    `Levy Desk does not file returns or make payments on your behalf.`,
    `You received this because you requested a reminder at ${baseUrl}.`,
    `This is a one-off email — we will not contact you again unless you sign up.`,
  ].join('\n')

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1c1917">
      <p style="font-size:13px;color:#78716c;margin-bottom:24px">Levy Desk</p>
      <h1 style="font-size:20px;font-weight:700;margin:0 0 4px">
        Your estimated ${councilLabel} visitor levy
      </h1>
      <table style="border-collapse:collapse;margin:20px 0;width:100%">
        <tr>
          <td style="padding:10px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px 8px 0 0">
            <span style="font-size:13px;color:#c2410c;font-weight:500">Estimated levy</span><br>
            <span style="font-size:32px;font-weight:700;color:#1c1917">${pence(params.levyPence)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 16px;background:#f5f5f4;border:1px solid #e7e5e4;border-top:none">
            <table style="width:100%;font-size:13px">
              <tr>
                <td style="color:#78716c;padding:2px 0">Council</td>
                <td style="text-align:right;font-weight:600">${councilLabel}</td>
              </tr>
              <tr>
                <td style="color:#78716c;padding:2px 0">Next filing deadline</td>
                <td style="text-align:right;font-weight:600;color:#dc2626">${deadlineStr}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="font-size:14px;color:#57534e;line-height:1.6">
        This is an estimate based on the details you entered. The actual levy for your return will depend on all bookings for the quarter.
      </p>
      <table style="margin:24px 0;width:100%">
        <tr>
          <td style="padding-right:8px">
            <a href="${baseUrl}/account" style="display:block;background:#ea580c;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;text-align:center">
              File your return with Levy Desk
            </a>
          </td>
          <td>
            <a href="${guideUrl}" style="display:block;background:#f5f5f4;color:#1c1917;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;text-align:center;border:1px solid #e7e5e4">
              Step-by-step filing guide
            </a>
          </td>
        </tr>
      </table>
      <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0">
      <p style="font-size:11px;color:#a8a29e;line-height:1.5">
        Levy Desk does not file returns or make payments on your behalf.
        You received this because you requested a reminder at levydesk.co.uk.
        This is a one-off email — we will not contact you again unless you sign up.
      </p>
    </div>
  `

  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? 'Levy Desk <noreply@levydesk.co.uk>',
    to: params.toEmail,
    subject,
    text,
    html,
  })
}
