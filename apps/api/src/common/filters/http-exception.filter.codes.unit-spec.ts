import { describe, expect, it, jest } from '@jest/globals'
import { BadRequestException, type HttpException, HttpStatus } from '@nestjs/common'
import { mockDeep } from 'jest-mock-extended'
import type { I18nService } from 'nestjs-i18n'
import { ZodValidationPipe } from 'nestjs-zod'
import { z } from 'zod'
import { TranslatableException } from '../exceptions/translatable.exception'
import { HttpExceptionFilter } from './http-exception.filter'

/** Renders `lang|key|args` so a test sees exactly which key, locale and interpolation args the filter chose. */
const makeI18n = () => {
  const i18n = mockDeep<I18nService>()
  i18n.translate.mockImplementation((key, options) => {
    const opts = options as { lang?: string; args?: Record<string, unknown> } | undefined
    return `${opts?.lang}|${String(key)}|${JSON.stringify(opts?.args ?? {})}`
  })
  return i18n
}

const run = (exception: unknown, acceptLanguage?: string) => {
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })
  const request = {
    method: 'POST',
    url: '/t',
    headers: acceptLanguage ? { 'accept-language': acceptLanguage } : {},
    query: {},
  }
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }), getRequest: () => request }),
  }
  new HttpExceptionFilter(makeI18n()).catch(exception, host as never)
  return json.mock.calls[0]?.[0] as Record<string, unknown>
}

const zodFailure = (schema: z.ZodType, input: unknown): HttpException => {
  try {
    new ZodValidationPipe(schema).transform(input, { type: 'body' })
  } catch (error) {
    return error as HttpException
  }
  throw new Error('expected the schema to reject the input')
}

describe('HttpExceptionFilter error codes (AC1)', () => {
  it('answers a keyed exception with its key as `code` and the message in the request locale', () => {
    const body = run(
      new TranslatableException('errors.track.not_found', HttpStatus.NOT_FOUND, { id: 'x' }),
      'uk',
    )

    expect(body).toMatchObject({
      statusCode: 404,
      code: 'errors.track.not_found',
      message: 'uk|errors.track.not_found|{"id":"x"}',
    })
  })

  it('falls back to en for an unsupported locale', () => {
    const body = run(
      new TranslatableException('errors.track.not_found', HttpStatus.NOT_FOUND, { id: 'x' }),
      'fr-FR',
    )

    expect(body.message).toBe('en|errors.track.not_found|{"id":"x"}')
  })

  it('resolves every supported locale', () => {
    for (const lang of ['ru', 'pl', 'de']) {
      const body = run(
        new TranslatableException('errors.track.not_found', HttpStatus.NOT_FOUND, {}),
        `${lang}-XX,en;q=0.5`,
      )
      expect(String(body.message).startsWith(`${lang}|`)).toBe(true)
    }
  })

  it('gives a plain keyed HttpException a code too', () => {
    const body = run(new BadRequestException('errors.auth.user_not_found'))

    expect(body.code).toBe('errors.auth.user_not_found')
  })

  it('omits `code` for a literal, unkeyed message', () => {
    const body = run(new BadRequestException('Some English literal'))

    expect(body.message).toBe('Some English literal')
    expect(body).not.toHaveProperty('code')
  })

  it('omits `code` for an unexpected error', () => {
    expect(run(new Error('boom'))).not.toHaveProperty('code')
  })
})

describe('HttpExceptionFilter zod translation (AC2)', () => {
  const schema = z.object({
    name: z.string().min(3),
    age: z.number().max(10),
    mail: z.string().email(),
    kind: z.enum(['a', 'b']),
    tags: z.array(z.string()).min(1),
    custom: z.string().min(2, { message: 'Hand written English' }),
    keyed: z.string().min(2, { message: 'validation.password_too_short' }),
  })
  const input = { name: 'a', age: 99, mail: 'x', kind: 'z', tags: [], custom: 'a', keyed: 'a' }

  it('translates each issue in the request locale with a per-field code', () => {
    const body = run(zodFailure(schema, input), 'ru')
    const byPath = Object.fromEntries(
      (body.errors as { path: string; code?: string; message: string }[]).map((e) => [e.path, e]),
    )

    expect(body).toMatchObject({ statusCode: 400, code: 'errors.validation.failed' })
    expect(body.message).toBe('ru|errors.validation.failed|{}')
    expect(byPath.name).toEqual({
      path: 'name',
      code: 'validation.too_small.string',
      message: 'ru|validation.too_small.string|{"minimum":3}',
    })
    expect(byPath.age?.code).toBe('validation.too_big.number')
    expect(byPath.mail?.code).toBe('validation.invalid_format.email')
    expect(byPath.kind).toMatchObject({
      code: 'validation.invalid_value',
      message: 'ru|validation.invalid_value|{"values":"a, b"}',
    })
    expect(byPath.tags?.code).toBe('validation.too_small.array')
  })

  it('maps a missing field to validation.required and a wrong type to validation.invalid_type', () => {
    const body = run(zodFailure(z.object({ a: z.string(), n: z.number() }), { n: 's' }), 'de')
    const errors = body.errors as { path: string; code: string }[]

    expect(errors.find((e) => e.path === 'a')?.code).toBe('validation.required')
    expect(errors.find((e) => e.path === 'n')?.code).toBe('validation.invalid_type')
  })

  it('keeps a hand-written literal message and has no code for it', () => {
    const errors = run(zodFailure(schema, input), 'pl').errors as {
      path: string
      code?: string
      message: string
    }[]
    const custom = errors.find((e) => e.path === 'custom')

    expect(custom?.message).toBe('Hand written English')
    expect(custom).not.toHaveProperty('code')
  })

  it('translates a message that is already a dictionary key', () => {
    const errors = run(zodFailure(schema, input), 'uk').errors as {
      path: string
      code?: string
      message: string
    }[]

    expect(errors.find((e) => e.path === 'keyed')).toEqual({
      path: 'keyed',
      code: 'validation.password_too_short',
      message: 'uk|validation.password_too_short|{}',
    })
  })

  it('joins nested paths with dots', () => {
    const body = run(zodFailure(z.object({ a: z.array(z.object({ b: z.string() })) }), { a: [{}] }))

    expect((body.errors as { path: string }[])[0]?.path).toBe('a.0.b')
  })
})
