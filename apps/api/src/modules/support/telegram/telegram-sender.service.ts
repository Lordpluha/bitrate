import type { AppConfig } from '@common/config'
import type { TelegramSendJob } from '@infra/queues/support-telegram.queue'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UnrecoverableError } from 'bullmq'
import { loadSupportCore } from '../knowledge/load-support-core'
import { sendTelegramMessage, TelegramApiError } from './telegram-bot-api'

/** Renders a message for Telegram (HTML, sources, 4000-character parts) and sends it. */
@Injectable()
export class TelegramSender {
  constructor(private readonly config: ConfigService<AppConfig>) {}

  async send({ chatId, text, citations, locale }: TelegramSendJob): Promise<void> {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN')
    if (!token) throw new UnrecoverableError('TELEGRAM_BOT_TOKEN is not set')
    const { renderForChannel } = await loadSupportCore()
    for (const part of renderForChannel({ text, citations }, 'telegram', locale)) {
      try {
        await sendTelegramMessage(token, chatId, part)
      } catch (error: unknown) {
        if (error instanceof TelegramApiError && error.permanent) {
          throw new UnrecoverableError(error.message)
        }
        throw error
      }
    }
  }
}
