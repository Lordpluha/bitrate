import { escapeHtml } from '@common/utils/html'
import type { LinkMailParams, RenderedMail } from '../mail-template.types'

/** Renders the English email-verification email. */
export function renderEmailVerification({ username, url }: LinkMailParams): RenderedMail {
  return {
    subject: 'Verify your email',
    html: `
      <h2>Hi, ${escapeHtml(username)}</h2>
      <p>Confirm your email address to finish creating your account:</p>
      <p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
      <p>This link expires in <strong>24 hours</strong>.</p>
    `,
  }
}
