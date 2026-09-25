import { escapeHtml } from '@common/utils/html'
import type { LinkMailParams, RenderedMail } from '../mail-template.types'

/** Renders the Ukrainian password-reset email. */
export function renderPasswordReset({ username, url }: LinkMailParams): RenderedMail {
  return {
    subject: 'Скидання пароля',
    html: `
      <h2>Вітаємо, ${escapeHtml(username)}</h2>
      <p>Ви запросили скидання пароля. Перейдіть за посиланням нижче, щоб встановити новий пароль:</p>
      <p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
      <p>Посилання дійсне протягом <strong>1 години</strong>.</p>
      <p>Якщо ви не робили цей запит, просто проігноруйте цей лист.</p>
    `,
  }
}
