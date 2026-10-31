import nodemailer from 'nodemailer'

export type InviteEmailInput = {
  toEmail: string
  workspaceName: string
  inviterName: string
  role: string
  inviteUrl: string
}

export async function sendInviteEmail(input: InviteEmailInput): Promise<void> {
  if (!process.env.EMAIL_SERVER) return

  const transport = nodemailer.createTransport(process.env.EMAIL_SERVER)
  const roleLabel = input.role === 'ACCOUNTANT' ? 'read-only accountant' : 'admin'

  const subject = `You've been invited to ${input.workspaceName} on Levy Desk`

  const text = [
    `Hello,`,
    ``,
    `${input.inviterName} has invited you to join ${input.workspaceName} on Levy Desk as a ${roleLabel}.`,
    ``,
    `Accept your invitation here:`,
    `${input.inviteUrl}`,
    ``,
    `This link expires in 7 days. If you did not expect this invitation, you can ignore this email.`,
    ``,
    `— Levy Desk`,
  ].join('\n')

  const html = `
    <p>Hello,</p>
    <p><strong>${input.inviterName}</strong> has invited you to join
    <strong>${input.workspaceName}</strong> on Levy Desk as a <strong>${roleLabel}</strong>.</p>
    <p style="margin:24px 0">
      <a href="${input.inviteUrl}"
         style="display:inline-block;background:#1c1917;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
        Accept invitation →
      </a>
    </p>
    <p style="font-size:12px;color:#a0aec0">
      This link expires in 7 days. If you did not expect this invitation, you can safely ignore this email.
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
