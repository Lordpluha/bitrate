import { describe, expect, it } from '@jest/globals'
import { z } from 'zod'
import enValidation from '../../i18n/en/validation.json'
import { type ZodIssueLike, zodIssueKey } from './zod-issue-key'

/** Resolves `validation.a.b` against the en dictionary. */
const lookup = (key: string): string | undefined => {
  let node: unknown = enValidation
  for (const segment of key.replace(/^validation\./, '').split('.')) {
    node =
      typeof node === 'object' && node !== null
        ? (node as Record<string, unknown>)[segment]
        : undefined
  }
  return typeof node === 'string' ? node : undefined
}

/** The issues zod raises when `schema` rejects `input`. */
const issuesOf = (schema: z.ZodType, input: unknown): ZodIssueLike[] => {
  const result = schema.safeParse(input)
  return result.success ? [] : (result.error.issues as unknown as ZodIssueLike[])
}

describe('zodIssueKey', () => {
  const cases: [string, z.ZodType, unknown, string][] = [
    ['missing field', z.object({ a: z.string() }), {}, 'validation.required'],
    ['wrong type', z.number(), 's', 'validation.invalid_type'],
    ['string too short', z.string().min(3), 'a', 'validation.too_small.string'],
    ['number too small', z.number().min(3), 1, 'validation.too_small.number'],
    ['number not above', z.number().gt(3), 3, 'validation.too_small.number_exclusive'],
    ['array too short', z.array(z.string()).min(1), [], 'validation.too_small.array'],
    ['string too long', z.string().max(1), 'abc', 'validation.too_big.string'],
    ['number too big', z.number().max(1), 3, 'validation.too_big.number'],
    ['number not below', z.number().lt(1), 1, 'validation.too_big.number_exclusive'],
    ['array too long', z.array(z.string()).max(1), ['a', 'b'], 'validation.too_big.array'],
    ['email', z.string().email(), 'x', 'validation.invalid_format.email'],
    ['url', z.string().url(), 'x', 'validation.invalid_format.url'],
    ['uuid', z.string().uuid(), 'x', 'validation.invalid_format.uuid'],
    ['regex', z.string().regex(/^a$/), 'x', 'validation.invalid_format.regex'],
    ['other format', z.string().datetime(), 'x', 'validation.invalid_format.other'],
    ['enum', z.enum(['a', 'b']), 'z', 'validation.invalid_value'],
    ['unknown key', z.object({}).strict(), { a: 1 }, 'validation.unrecognized_keys'],
    ['multiple of', z.number().multipleOf(5), 3, 'validation.not_multiple_of'],
    ['union', z.union([z.string(), z.number()]), true, 'validation.invalid_input'],
    ['bare refine', z.string().refine(() => false), 'x', 'validation.invalid_input'],
  ]

  it.each(cases)(
    '%s maps to a key that exists in the dictionary with its args',
    (_name, schema, input, expected) => {
      const mapped = zodIssueKey(issuesOf(schema, input)[0] as ZodIssueLike)

      expect(mapped?.key).toBe(expected)
      const text = lookup(expected)
      expect(text).toBeDefined()
      for (const placeholder of text?.match(/\{(\w+)\}/g) ?? []) {
        expect(mapped?.args).toHaveProperty([placeholder.slice(1, -1)])
      }
    },
  )

  it('leaves a hand-written message alone', () => {
    expect(
      zodIssueKey(issuesOf(z.string().min(3, { message: 'Hand written' }), 'a')[0] as ZodIssueLike),
    ).toBeUndefined()
    expect(
      zodIssueKey(
        issuesOf(z.string().email({ message: 'Invalid email format' }), 'a')[0] as ZodIssueLike,
      ),
    ).toBeUndefined()
  })
})
