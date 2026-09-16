import type { ParamMap } from '@angular/router'

/** Encodes and decodes one filter/page value against one query-string parameter. */
export type ParamCodec<TValue> = {
  decode: (raw: string | null) => TValue
  /** `null` means "matches the default — omit this parameter from the URL". */
  encode: (value: TValue) => string | null
}

type QueryFieldSpec<TValue> = {
  param: string
  codec: ParamCodec<TValue>
}

type QueryFieldSpecs<T> = {
  [K in keyof T]: QueryFieldSpec<T[K]>
}

/** Decodes a screen's whole query state from the URL, and serialises it back for navigation. */
export type QueryCodec<T> = {
  defaults: T
  decode: (params: ParamMap) => T
  serialize: (state: T) => Record<string, string>
}

type CreateQueryCodecInput<T> = {
  defaults: T
  fields: QueryFieldSpecs<T>
}

/**
 * Builds a `QueryCodec` from one field spec per key of `T`. A key equal to its default is
 * omitted from the serialised query string, so an untouched screen keeps a clean URL — never
 * `?status=&page=1`.
 */
export function createQueryCodec<T extends Record<string, unknown>>({
  defaults,
  fields,
}: CreateQueryCodecInput<T>): QueryCodec<T> {
  const keys = Object.keys(fields) as (keyof T)[]

  return {
    defaults,
    decode: (params) => {
      const state = { ...defaults }
      for (const key of keys) {
        state[key] = fields[key].codec.decode(params.get(fields[key].param))
      }
      return state
    },
    serialize: (state) => {
      const query: Record<string, string> = {}
      for (const key of keys) {
        const encoded = fields[key].codec.encode(state[key])
        if (encoded !== null) query[fields[key].param] = encoded
      }
      return query
    },
  }
}

/** A free-text filter. The empty string is the universal "no filter" default and is never sent. */
export function stringParam(defaultValue = ''): ParamCodec<string> {
  return {
    decode: (raw) => raw ?? defaultValue,
    encode: (value) => (value === defaultValue ? null : value),
  }
}

/** A page/limit-shaped positive integer. Missing, non-numeric, or non-positive falls back to the default. */
export function intParam(defaultValue: number): ParamCodec<number> {
  return {
    decode: (raw) => {
      if (raw === null) return defaultValue
      const parsed = Number.parseInt(raw, 10)
      return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue
    },
    encode: (value) => (value === defaultValue ? null : String(value)),
  }
}

type EnumParamInput<TUnion extends string> = {
  /** The full union as a tuple — build it with `coveringTuple` so a missed member fails to compile. */
  members: readonly TUnion[]
  default: TUnion | null
  /**
   * The token that decodes to `null` when the default is itself a real member (moderation's
   * `OPEN`) and "no filter" still needs to be reachable from a URL.
   */
  nullToken?: string
}

/** A closed set of string values, decoded against `members` and falling back to `default` otherwise. */
export function enumParam<TUnion extends string>({
  members,
  default: defaultValue,
  nullToken,
}: EnumParamInput<TUnion>): ParamCodec<TUnion | null> {
  return {
    decode: (raw) => {
      if (raw === null) return defaultValue
      if (nullToken !== undefined && raw === nullToken) return null
      return (members as readonly string[]).includes(raw) ? (raw as TUnion) : defaultValue
    },
    encode: (value) => {
      if (value === defaultValue) return null
      if (value === null) return nullToken ?? null
      return value
    },
  }
}

export type TriState = 'all' | 'verified' | 'unverified'

/** The artists screen's verified/unverified toggle — `all` is the default and is never sent. */
export function triStateParam(): ParamCodec<TriState> {
  return {
    decode: (raw) => (raw === 'verified' || raw === 'unverified' ? raw : 'all'),
    encode: (value) => (value === 'all' ? null : value),
  }
}
