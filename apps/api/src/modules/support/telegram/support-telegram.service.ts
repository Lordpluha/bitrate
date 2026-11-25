import type { Citation, Locale } from '@bitrate/support-core'
import type { AppConfig } from '@common/config'
import { REDIS_CLIENT } from '@infra/cache/cache.constants'
import {
  SUPPORT_TELEGRAM_QUEUE,
  SUPPORT_TELEGRAM_SEND_JOB,
  SUPPORT_TELEGRAM_UPDATE_JOB,
  TELEGRAM_SEND_JOB_OPTIONS,
  TELEGRAM_UPDATE_JOB_OPTIONS,
  type TelegramUpdateJob,
} from '@infra/queues/support-telegram.queue'
import { InjectQueue } from '@nestjs/bullmq'
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Queue } from 'bullmq'
import type { Redis } from 'ioredis'
import { SupportConversationsService } from '../chat/support-conversations.service'
import { MAX_SUPPORT_MESSAGE_CHARS } from '../chat/support-limits'
import { SupportTurnService } from '../chat/support-turn.service'
import { acquireTurnLock } from '../chat/support-turn-lock'
import { loadSupportCore } from '../knowledge/load-support-core'
import { checkContactRate } from './check-contact-rate'
import { parseTelegramUpdate } from './parse-telegram-update'
import { telegramLocale } from './telegram-locale'
import { isTelegramSecret } from './telegram-secret'

/** Thrown before a turn starts while another one holds the conversation; the job retries. */
export class TelegramTurnBusyError extends Error {
  override name = 'TelegramTurnBusyError'
}

/**
 * The support assistant in Telegram (#574): the webhook verifies and enqueues an update, the
 * worker runs the same turn as the web chat and queues the answer for sending.
 */
@Injectable()
export class SupportTelegramService {
  private readonly logger = new Logger(SupportTelegramService.name)

  constructor(
    private readonly config: ConfigService<AppConfig>,
    private readonly conversations: SupportConversationsService,
    private readonly turns: SupportTurnService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @InjectQueue(SUPPORT_TELEGRAM_QUEUE) private readonly queue: Queue,
  ) {}

  /** Off (404) until both the token and the secret are set; a wrong secret is 401. */
  async accept(secret: string | undefined, body: unknown): Promise<void> {
    const expected = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET')
    if (!(expected && this.config.get<string>('TELEGRAM_BOT_TOKEN'))) throw new NotFoundException()
    if (!isTelegramSecret(expected, secret)) throw new UnauthorizedException()
    const update = parseTelegramUpdate(body)
    if (!update) return
    // The update id makes a redelivered update one job.
    await this.queue.add(SUPPORT_TELEGRAM_UPDATE_JOB, update, {
      ...TELEGRAM_UPDATE_JOB_OPTIONS,
      jobId: `telegram-update-${update.updateId}`,
    })
  }

  /** One incoming message. Throws only before the turn starts, so a retry never repeats it. */
  async handleUpdate(update: TelegramUpdateJob): Promise<void> {
    const locale = telegramLocale(update.languageCode)
    const { FIXED_TEXTS } = await loadSupportCore()
    if (/^\/start(\s|$)/.test(update.text)) {
      return await this.reply(update.chatId, FIXED_TEXTS[locale].welcome, [], locale)
    }
    const rate = await checkContactRate(this.redis, 'telegram', update.chatId)
    if (rate === 'notify')
      return await this.reply(update.chatId, FIXED_TEXTS[locale].limited, [], locale)
    if (rate === 'drop') return

    const conversation = await this.conversations.forContact('telegram', update.chatId, locale)
    const release = await acquireTurnLock(this.redis, conversation.id)
    if (!release) throw new TelegramTurnBusyError()
    try {
      let answer = ''
      const citations: Citation[] = []
      for await (const event of this.turns.run(
        conversation,
        update.text.slice(0, MAX_SUPPORT_MESSAGE_CHARS),
      )) {
        if (event.type === 'text-delta') answer += event.text
        if (event.type === 'citation') citations.push(event.citation)
      }
      // While an operator holds the conversation the turn only stores the message.
      if (answer.trim()) await this.reply(update.chatId, answer, citations, conversation.locale)
    } catch (error: unknown) {
      // Never log the message text; the turn already handed off what it could.
      this.logger.error(`Telegram turn ${conversation.id} failed: ${String(error)}`)
    } finally {
      await release()
    }
  }

  private async reply(chatId: string, text: string, citations: Citation[], locale: Locale) {
    await this.queue.add(
      SUPPORT_TELEGRAM_SEND_JOB,
      { chatId, text, citations, locale },
      TELEGRAM_SEND_JOB_OPTIONS,
    )
  }
}
