/** A failed Bot API call. The message never names the URL: it carries the bot token. */
export class TelegramApiError extends Error {
  constructor(readonly status: number) {
    super(`Telegram Bot API answered ${status}`)
    this.name = 'TelegramApiError'
  }

  /** A bad message (400) or a user who blocked the bot (403) does not get better on retry. */
  get permanent(): boolean {
    return this.status === 400 || this.status === 403
  }
}

/** Sends one HTML message (`parse_mode: HTML`) through the Bot API. */
export async function sendTelegramMessage(token: string, chatId: string, html: string) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: html,
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    }),
  })
  if (!response.ok) throw new TelegramApiError(response.status)
}
