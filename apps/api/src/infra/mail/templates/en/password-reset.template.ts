import { escapeHtml } from '@common/utils/html'
import type { LinkMailParams, RenderedMail } from '../mail-template.types'

/** Renders the English password-reset email. */
export function renderPasswordReset({ username, url }: LinkMailParams): RenderedMail {
  return {
    subject: 'Reset your password',
    html: `
      <h2>Hi, ${escapeHtml(username)}</h2>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
      <p>This link expires in <strong>1 hour</strong>.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  }
}
