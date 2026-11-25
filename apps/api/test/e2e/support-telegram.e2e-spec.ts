import type { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { closeE2eApp, createE2eApp } from './e2e-app'

/**
 * The Telegram channel of the support assistant (#574) with the Bot API mocked at `fetch`.
 * `.env.test` configures no chat model, so a turn takes the "assistant unavailable" path and
 * the bot sends the handoff text: deterministic, and what production does without the keys.
 */
const SECRET = 'e2e-telegram-secret-0123'
const TOKEN = '123456:e2e-telegram-token-abcdefgh'
const CHAT = 777

type SentMessage = { chat_id: string; text: string; parse_mode: string }

const update = (id: number, text: string) => ({
  update_id: id,
  message: {
    message_id: id,
    date: 0,
    chat: { id: CHAT, type: 'private' },
    from: { id: CHAT, is_bot: false, first_name: 'E2E', language_code: 'uk' },
    text,
  },
})

describe('Support in Telegram (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  const sent: SentMessage[] = []

  beforeAll(async () => {
    process.env.TELEGRAM_BOT_TOKEN = TOKEN
    process.env.TELEGRAM_WEBHOOK_SECRET = SECRET
    const realFetch = globalThis.fetch
    jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      if (!String(input).startsWith('https://api.telegram.org/'))
        return await realFetch(input, init)
      expect(String(input)).toBe(`https://api.telegram.org/bot${TOKEN}/sendMessage`)
      sent.push(JSON.parse(String(init?.body)))
      return new Response('{"ok":true,"result":{}}', { status: 200 })
    })
    const setup = await createE2eApp()
    app = setup.app
    prisma = setup.prisma
  })

  afterAll(async () => {
    jest.restoreAllMocks()
    delete process.env.TELEGRAM_BOT_TOKEN
    delete process.env.TELEGRAM_WEBHOOK_SECRET
    await closeE2eApp(app)
  })

  beforeEach(async () => {
    sent.length = 0
    await prisma.supportConversation.deleteMany()
  })

  const post = (body: object, secret = SECRET) =>
    request(app.getHttpServer())
      .post('/support/telegram/webhook')
      .set('x-telegram-bot-api-secret-token', secret)
      .send(body)

  /** The worker answers asynchronously; wait for it rather than for a fixed time. */
  async function until(done: () => Promise<boolean> | boolean, what: string) {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await done()) return
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    throw new Error(`Timed out waiting for ${what}`)
  }

  it('rejects a forged secret and sends nothing', async () => {
    await post(update(1, 'Привіт'), 'forged-secret-0000000000').expect(401)
    await request(app.getHttpServer())
      .post('/support/telegram/webhook')
      .send(update(2, 'x'))
      .expect(401)

    expect(sent).toHaveLength(0)
    expect(await prisma.supportConversation.count()).toBe(0)
  })

  it('greets /start in the user’s language', async () => {
    await post(update(3, '/start')).expect(200)
    await until(() => sent.length === 1, 'the greeting')

    expect(sent[0]).toMatchObject({ chat_id: String(CHAT), parse_mode: 'HTML' })
    expect(sent[0]?.text).toContain('Bitrate')
    expect(await prisma.supportConversation.count()).toBe(0)
  })

  it('hands a message to an operator, then stores the next one without answering it', async () => {
    await post(update(4, 'Як видалити акаунт?')).expect(200)
    await until(() => sent.length === 1, 'the handoff reply')

    expect(sent[0]?.text).toMatch(/Оператор/)
    const [conversation] = await prisma.supportConversation.findMany({
      where: { channel: 'TELEGRAM' },
      include: { ticket: true },
    })
    expect(conversation).toMatchObject({
      externalId: String(CHAT),
      audience: 'LISTENER',
      locale: 'uk',
      state: 'WAITING_OPERATOR',
    })
    expect(conversation?.ticket?.status).toBe('OPEN')

    await post(update(5, 'Є новини?')).expect(200)
    await until(
      async () => (await prisma.supportMessage.count({ where: { role: 'USER' } })) === 2,
      'the second message',
    )
    expect(await prisma.supportConversation.count()).toBe(1)
    expect(sent).toHaveLength(1)
  })

  it('answers 200 to an update it does not handle', async () => {
    await post({ update_id: 6, edited_message: update(6, 'x').message }).expect(200)
    expect(await prisma.supportConversation.count()).toBe(0)
  })
})
