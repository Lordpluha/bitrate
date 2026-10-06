import { z } from 'zod'

/** What one zod issue maps to: a `validation.*` dictionary key plus its `{placeholder}` args. */
export type ZodIssueKey = { key: string; args?: Record<string, unknown> }

/** The slice of a zod issue the mapping reads; every field beyond `code`/`message` is optional. */
export type ZodIssueLike = {
  code: string
  message: string
  path?: PropertyKey[]
  expected?: string
  origin?: string
  minimum?: number | bigint
  maximum?: number | bigint
  inclusive?: boolean
  format?: string
  values?: unknown[]
  keys?: string[]
  divisor?: number
}

/** String formats that have their own `validation.invalid_format.<format>` key. */
const KNOWN_FORMATS = ['email', 'url', 'uuid', 'regex'] as const

/** A raw issue as zod's own locale functions accept it. */
type RawIssue = Parameters<ReturnType<typeof z.locales.en>['localeError']>[0]

const englishLocale = z.locales.en()

/** Drops the `, received <type>` tail, which depends on the input and is not in the final issue. */
const withoutReceived = (message: string): string => message.replace(/, received .*$/, '')

/** The English text zod itself produces for an issue, or undefined when it has none. */
function zodDefaultMessage(issue: ZodIssueLike): string | undefined {
  const produced = englishLocale.localeError({ ...issue, input: undefined } as unknown as RawIssue)
  return typeof produced === 'string' ? produced : produced?.message
}

/** True when the issue's message is zod's own default rather than a hand-written DTO message. */
function hasDefaultMessage(issue: ZodIssueLike): boolean {
  const defaults = zodDefaultMessage(issue)
  return defaults !== undefined && withoutReceived(defaults) === withoutReceived(issue.message)
}

/** Buckets a zod `origin` into the size families the dictionary distinguishes. */
function sizeKind(issue: ZodIssueLike): string {
  const exclusive = issue.inclusive === false
  switch (issue.origin) {
    case 'string':
      return 'string'
    case 'number':
    case 'int':
    case 'bigint':
      return exclusive ? 'number_exclusive' : 'number'
    case 'array':
    case 'set':
      return 'array'
    default:
      return 'other'
  }
}

/**
 * Maps one zod issue to a dictionary key. Returns undefined when the issue carries a
 * hand-written DTO message — those stay exactly as written (the literal scan allowlists them
 * until they are keyed). A DTO message that is already a key is resolved by the caller.
 *
 * Key naming: `validation.<zod issue code>[.<variant>]` — `too_small`/`too_big` split by value
 * kind (`string`, `number`, `number_exclusive`, `array`, `other`), `invalid_format` by string
 * format (`email`, `url`, `uuid`, `regex`, `other`). A missing field is `validation.required`;
 * everything zod can emit without its own key (unions, refinements, …) is
 * `validation.invalid_input`.
 */
export function zodIssueKey(issue: ZodIssueLike): ZodIssueKey | undefined {
  if (!hasDefaultMessage(issue)) return undefined

  switch (issue.code) {
    case 'invalid_type':
      return issue.message.endsWith('received undefined')
        ? { key: 'validation.required' }
        : { key: 'validation.invalid_type', args: { expected: issue.expected } }
    case 'too_small':
      return {
        key: `validation.too_small.${sizeKind(issue)}`,
        args: { minimum: Number(issue.minimum) },
      }
    case 'too_big':
      return {
        key: `validation.too_big.${sizeKind(issue)}`,
        args: { maximum: Number(issue.maximum) },
      }
    case 'invalid_format': {
      const known = KNOWN_FORMATS.find((format) => format === issue.format)
      return {
        key: `validation.invalid_format.${known ?? 'other'}`,
        args: { format: issue.format },
      }
    }
    case 'invalid_value':
      return {
        key: 'validation.invalid_value',
        args: { values: (issue.values ?? []).map(String).join(', ') },
      }
    case 'unrecognized_keys':
      return { key: 'validation.unrecognized_keys', args: { keys: (issue.keys ?? []).join(', ') } }
    case 'not_multiple_of':
      return { key: 'validation.not_multiple_of', args: { divisor: issue.divisor } }
    default:
      return { key: 'validation.invalid_input' }
  }
}
