import { escapeHtml } from '@common/utils/html'
import type { LinkMailParams, RenderedMail } from '../mail-template.types'

/** Renders the Ukrainian email-verification email. */
export function renderEmailVerification({ username, url }: LinkMailParams): RenderedMail {
  return {
    subject: 'Підтвердьте свою електронну адресу',
    html: `
      <h2>Вітаємо, ${escapeHtml(username)}</h2>
      <p>Підтвердьте свою електронну адресу, щоб завершити створення облікового запису:</p>
      <p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
      <p>Посилання дійсне протягом <strong>24 годин</strong>.</p>
    `,
  }
}
