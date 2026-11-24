import type { SupportEvent } from '@bitrate/support-core'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import type { Queue } from 'bullmq'
import type { Redis } from 'ioredis'
import type { SupportConversationRow } from '../chat/support-conversation-row'
import type { SupportConversationsService } from '../chat/support-conversations.service'
import type { SupportTurnService } from '../chat/support-turn.service'
import { SupportTelegramService, TelegramTurnBusyError } from './support-telegram.service'

jest.mock('../knowledge/load-support-core', () => ({
  loadSupportCore: async () => jest.requireActual('@bitrate/support-core'),
}))

const SECRET = 'telegram-secret-123'
const update = (text: string) => ({ updateId: 7, chatId: '42', text, languageCode: 'uk' })
const body = (text: string) => ({
  update_id: 7,
  message: { chat: { id: 42, type: 'private' }, from: { language_code: 'uk' }, text },
})

const conversation: SupportConversationRow = {
  id: 'c-1',
  audience: 'listener',
  locale: 'uk',
  channel: 'telegram',
  state: 'bot',
  inputTokens: 0,
  outputTokens: 0,
}

async function* events(list: SupportEvent[]): AsyncGenerator<SupportEvent> {
  yield* list
}

function setup(
  env: Record<string, string | undefined> = {
    TELEGRAM_BOT_TOKEN: 'token-1234567890abcdefgh',
    TELEGRAM_WEBHOOK_SECRET: SECRET,
  },
) {
  const queue = { add: jest.fn(async (..._args: unknown[]) => ({})) }
  const counter = { value: 0 }
  const redis = {
    incr: jest.fn(async () => ++counter.value),
    expire: jest.fn(async () => 1),
    set: jest.fn(async () => 'OK' as const),
    eval: jest.fn(async () => 1),
  }
  const conversations = { forContact: jest.fn(async (..._args: unknown[]) => conversation) }
  const turns = { run: jest.fn((..._args: unknown[]) => events([])) }
  const config = { get: (key: string) => env[key] }
  const service = new SupportTelegramService(
    config as unknown as ConfigService,
    conversations as unknown as SupportConversationsService,
    turns as unknown as SupportTurnService,
    redis as unknown as Redis,
    queue as unknown as Queue,
  )
  return { service, queue, redis, conversations, turns, counter }
}

describe('SupportTelegramService', () => {
  describe('accept (webhook)', () => {
    it('is off until the token and the secret are set', async () => {
      const { service } = setup({})
      await expect(service.accept(SECRET, body('hi'))).rejects.toBeInstanceOf(NotFoundException)
    })

    it('rejects a forged or missing secret without queueing anything', async () => {
      const { service, queue } = setup()
      await expect(service.accept('forged-secret-0000', body('hi'))).rejects.toBeInstanceOf(
        UnauthorizedException,
      )
      await expect(service.accept(undefined, body('hi'))).rejects.toBeInstanceOf(
        UnauthorizedException,
      )
      expect(queue.add).not.toHaveBeenCalled()
    })

    it('queues a private text message once per update id, and ignores the rest', async () => {
      const { service, queue } = setup()
      await service.accept(SECRET, body('Привіт'))
      await service.accept(SECRET, {
        update_id: 8,
        message: { chat: { id: 1, type: 'group' }, text: 'x' },
      })

      expect(queue.add).toHaveBeenCalledTimes(1)
      expect(queue.add).toHaveBeenCalledWith(
        'update',
        { updateId: 7, chatId: '42', text: 'Привіт', languageCode: 'uk' },
        expect.objectContaining({ jobId: 'telegram-update-7' }),
      )
    })
  })

  describe('handleUpdate', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('greets /start in the user’s language without a turn', async () => {
      const { service, queue, turns } = setup()
      await service.handleUpdate(update('/start'))

      expect(turns.run).not.toHaveBeenCalled()
      expect(queue.add).toHaveBeenCalledWith(
        'send',
        expect.objectContaining({
          chatId: '42',
          text: expect.stringContaining('Bitrate'),
          locale: 'uk',
        }),
        expect.anything(),
      )
    })

    it('runs the turn and queues the answer with its sources', async () => {
      const { service, queue, turns, conversations } = setup()
      turns.run.mockReturnValue(
        events([
          { type: 'citation', citation: { chunkId: 'k', title: 'Payouts', url: '/help/payouts' } },
          { type: 'text-delta', text: 'Payouts arrive ' },
          { type: 'text-delta', text: 'monthly.' },
          {
            type: 'done',
            outcome: 'answered',
            grounded: true,
            usage: { inputTokens: 1, outputTokens: 1 },
          },
        ]),
      )

      await service.handleUpdate(update('When are payouts?'))

      expect(conversations.forContact).toHaveBeenCalledWith('telegram', '42', 'uk')
      expect(turns.run).toHaveBeenCalledWith(conversation, 'When are payouts?')
      expect(queue.add).toHaveBeenCalledWith(
        'send',
        {
          chatId: '42',
          text: 'Payouts arrive monthly.',
          citations: [{ chunkId: 'k', title: 'Payouts', url: '/help/payouts' }],
          locale: 'uk',
        },
        expect.anything(),
      )
    })

    it('sends nothing while an operator holds the conversation', async () => {
      const { service, queue } = setup()
      await service.handleUpdate(update('Any news?'))
      expect(queue.add).not.toHaveBeenCalled()
    })

    it('notifies once over the rate limit, then drops silently', async () => {
      const { service, queue, turns, counter } = setup()
      counter.value = 20
      await service.handleUpdate(update('one more'))
      await service.handleUpdate(update('and another'))

      expect(turns.run).not.toHaveBeenCalled()
      expect(queue.add).toHaveBeenCalledTimes(1)
      expect(queue.add).toHaveBeenCalledWith(
        'send',
        expect.objectContaining({ text: expect.stringContaining('хвилину') }),
        expect.anything(),
      )
    })

    it('retries later, before storing anything, while another turn holds the conversation', async () => {
      const { service, redis, turns } = setup()
      redis.set.mockResolvedValueOnce(null as unknown as 'OK')

      await expect(service.handleUpdate(update('hi'))).rejects.toBeInstanceOf(TelegramTurnBusyError)
      expect(turns.run).not.toHaveBeenCalled()
    })
  })
})
