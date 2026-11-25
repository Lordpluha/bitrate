import { describe, expect, it, jest } from '@jest/globals'
import { checkContactRate } from './check-contact-rate'
import { parseTelegramUpdate } from './parse-telegram-update'
import { telegramLocale } from './telegram-locale'
import { isTelegramSecret } from './telegram-secret'

const privateText = (text: string, extra: Record<string, unknown> = {}) => ({
  update_id: 7,
  message: {
    message_id: 1,
    date: 1,
    chat: { id: 42, type: 'private' },
    from: { id: 42, is_bot: false, first_name: 'A', language_code: 'uk' },
    text,
    ...extra,
  },
})

describe('parseTelegramUpdate', () => {
  it('takes the text, chat and language of a private message', () => {
    expect(parseTelegramUpdate(privateText('Привіт'))).toEqual({
      updateId: 7,
      chatId: '42',
      text: 'Привіт',
      languageCode: 'uk',
    })
  })

  it.each([
    [
      'a group message',
      {
        ...privateText('hi'),
        message: { ...privateText('hi').message, chat: { id: -5, type: 'group' } },
      },
    ],
    [
      'a photo without text',
      { update_id: 8, message: { chat: { id: 42, type: 'private' }, photo: [] } },
    ],
    ['a blank message', privateText('   ')],
    ['an edited message', { update_id: 9, edited_message: privateText('x').message }],
    ['something that is not an update', { hello: 'world' }],
  ])('ignores %s', (_label, body) => {
    expect(parseTelegramUpdate(body)).toBeNull()
  })
})

describe('isTelegramSecret', () => {
  it('accepts only the exact secret', () => {
    expect(isTelegramSecret('s3cret-value-1234', 's3cret-value-1234')).toBe(true)
    expect(isTelegramSecret('s3cret-value-1234', 's3cret-value-1235')).toBe(false)
    expect(isTelegramSecret('s3cret-value-1234', 'short')).toBe(false)
    expect(isTelegramSecret('s3cret-value-1234', undefined)).toBe(false)
  })
})

describe('telegramLocale', () => {
  it.each([
    ['uk', 'uk'],
    ['pl', 'pl'],
    ['en-GB', 'en'],
    ['de', 'en'],
    [undefined, 'en'],
  ])('maps %s to %s', (code, locale) => {
    expect(telegramLocale(code)).toBe(locale)
  })
})

describe('checkContactRate', () => {
  function redisAt(count: number) {
    return {
      incr: jest.fn(async (_key: string) => count),
      expire: jest.fn(async (_key: string, _seconds: number) => 1),
    }
  }

  it('allows up to the limit and starts the window on the first message', async () => {
    const first = redisAt(1)
    await expect(checkContactRate(first, 'telegram', '42')).resolves.toBe('allow')
    expect(first.expire).toHaveBeenCalledWith(expect.stringContaining('telegram:42'), 60)

    await expect(checkContactRate(redisAt(20), 'telegram', '42')).resolves.toBe('allow')
  })

  it('notifies once past the limit, then drops', async () => {
    await expect(checkContactRate(redisAt(21), 'telegram', '42')).resolves.toBe('notify')
    await expect(checkContactRate(redisAt(22), 'telegram', '42')).resolves.toBe('drop')
  })
})
