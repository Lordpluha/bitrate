import { afterEach, describe, expect, it, jest } from '@jest/globals'
import type { ConfigService } from '@nestjs/config'
import { UnrecoverableError } from 'bullmq'
import { TelegramSender } from './telegram-sender.service'

jest.mock('../knowledge/load-support-core', () => ({
  loadSupportCore: async () => jest.requireActual('@bitrate/support-core'),
}))

const TOKEN = 'token-1234567890abcdefgh'
const sender = (token: string | undefined) =>
  new TelegramSender({ get: () => token } as unknown as ConfigService)

function mockFetch(status = 200) {
  return jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => new Response('{"ok":true}', { status }))
}

describe('TelegramSender', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('sends the answer as Telegram HTML with its sources', async () => {
    const fetch = mockFetch()
    await sender(TOKEN).send({
      chatId: '42',
      text: 'Payouts arrive **monthly**.',
      citations: [{ chunkId: 'k', title: 'Payouts', url: 'https://bitrate.fm/help/payouts' }],
      locale: 'en',
    })

    const [url, init] = fetch.mock.calls[0] ?? []
    expect(String(url)).toBe(`https://api.telegram.org/bot${TOKEN}/sendMessage`)
    const payload = JSON.parse(String(init?.body))
    expect(payload).toMatchObject({ chat_id: '42', parse_mode: 'HTML' })
    expect(payload.text).toContain('<b>monthly</b>')
    expect(JSON.stringify(fetch.mock.calls.map(([, i]) => i?.body))).toContain('Payouts')
  })

  it('splits a long answer into parts within Telegram’s limit', async () => {
    const fetch = mockFetch()
    const paragraph = 'word '.repeat(700).trim()
    await sender(TOKEN).send({
      chatId: '42',
      text: `${paragraph}\n\n${paragraph}`,
      citations: [],
      locale: 'en',
    })

    expect(fetch.mock.calls.length).toBeGreaterThan(1)
    for (const [, init] of fetch.mock.calls) {
      expect(JSON.parse(String(init?.body)).text.length).toBeLessThanOrEqual(4000)
    }
  })

  it('gives up on a user who blocked the bot instead of retrying', async () => {
    mockFetch(403)
    await expect(
      sender(TOKEN).send({ chatId: '42', text: 'Hi', citations: [], locale: 'en' }),
    ).rejects.toBeInstanceOf(UnrecoverableError)
  })

  it('lets a server error retry', async () => {
    mockFetch(502)
    const error = await sender(TOKEN)
      .send({ chatId: '42', text: 'Hi', citations: [], locale: 'en' })
      .catch((e: unknown) => e)
    expect(error).not.toBeInstanceOf(UnrecoverableError)
    expect(String(error)).not.toContain(TOKEN)
  })

  it('does not retry without a bot token', async () => {
    await expect(
      sender(undefined).send({ chatId: '42', text: 'Hi', citations: [], locale: 'en' }),
    ).rejects.toBeInstanceOf(UnrecoverableError)
  })
})
