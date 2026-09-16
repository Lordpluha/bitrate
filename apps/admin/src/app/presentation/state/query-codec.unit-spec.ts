import { convertToParamMap } from '@angular/router'
import { describe, expect, it } from 'vitest'
import { createQueryCodec, enumParam, intParam, stringParam, triStateParam } from './query-codec'

type Status = 'OPEN' | 'REVIEWING' | 'RESOLVED'

const STATUSES: readonly Status[] = ['OPEN', 'REVIEWING', 'RESOLVED']

describe('createQueryCodec', () => {
  const codec = createQueryCodec({
    defaults: { q: '', page: 1 },
    fields: {
      q: { param: 'q', codec: stringParam() },
      page: { param: 'page', codec: intParam(1) },
    },
  })

  it('round-trips a non-default state through decode/serialize', () => {
    const state = { q: 'angular', page: 3 }
    const query = codec.serialize(state)

    expect(query).toEqual({ q: 'angular', page: '3' })
    expect(codec.decode(convertToParamMap(query))).toEqual(state)
  })

  it('omits every key equal to its default, including page 1', () => {
    expect(codec.serialize({ q: '', page: 1 })).toEqual({})
  })

  it('decodes a missing parameter as the default', () => {
    expect(codec.decode(convertToParamMap({}))).toEqual({ q: '', page: 1 })
  })

  it('decodes garbage as the default rather than throwing', () => {
    expect(codec.decode(convertToParamMap({ page: 'abc' }))).toEqual({ q: '', page: 1 })
    expect(codec.decode(convertToParamMap({ page: '-5' }))).toEqual({ q: '', page: 1 })
  })
})

describe('enumParam', () => {
  it('decodes an unknown value as the default', () => {
    const param = enumParam({ members: STATUSES, default: 'OPEN' })

    expect(param.decode('bogus')).toBe('OPEN')
    expect(param.decode(null)).toBe('OPEN')
  })

  it('decodes a valid member as itself', () => {
    const param = enumParam({ members: STATUSES, default: 'OPEN' })

    expect(param.decode('RESOLVED')).toBe('RESOLVED')
  })

  it('omits the default from the serialised query', () => {
    const param = enumParam({ members: STATUSES, default: 'OPEN' })

    expect(param.encode('OPEN')).toBeNull()
    expect(param.encode('RESOLVED')).toBe('RESOLVED')
  })

  describe('moderation-shaped: default is a real member, null reached through a token', () => {
    const param = enumParam({ members: STATUSES, default: 'OPEN', nullToken: 'all' })

    it('decodes a missing parameter as OPEN, not "no filter"', () => {
      expect(param.decode(null)).toBe('OPEN')
    })

    it('decodes the "all" token as null', () => {
      expect(param.decode('all')).toBeNull()
    })

    it('encodes null back to the "all" token', () => {
      expect(param.encode(null)).toBe('all')
    })

    it('omits OPEN, the default, from the URL', () => {
      expect(param.encode('OPEN')).toBeNull()
    })
  })
})

describe('triStateParam', () => {
  const param = triStateParam()

  it('decodes a missing or unknown value as "all"', () => {
    expect(param.decode(null)).toBe('all')
    expect(param.decode('bogus')).toBe('all')
  })

  it('decodes "verified" and "unverified" as themselves', () => {
    expect(param.decode('verified')).toBe('verified')
    expect(param.decode('unverified')).toBe('unverified')
  })

  it('omits "all", the default, from the URL', () => {
    expect(param.encode('all')).toBeNull()
    expect(param.encode('verified')).toBe('verified')
  })
})
