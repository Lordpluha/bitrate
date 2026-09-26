import { convertToParamMap } from '@angular/router'
import { describe, expect, it } from 'vitest'
import { overviewQueryCodec } from './overview.query'

describe('overviewQueryCodec', () => {
  it('decodes a missing days parameter to the 30-day default', () => {
    expect(overviewQueryCodec.decode(convertToParamMap({}))).toEqual({ days: 30 })
  })

  it('decodes a recognised range value', () => {
    expect(overviewQueryCodec.decode(convertToParamMap({ days: '7' }))).toEqual({ days: 7 })
    expect(overviewQueryCodec.decode(convertToParamMap({ days: '90' }))).toEqual({ days: 90 })
  })

  it('falls back to the default for a value outside the 7/30/90 allowlist', () => {
    expect(overviewQueryCodec.decode(convertToParamMap({ days: '365' }))).toEqual({ days: 30 })
  })

  it('falls back to the default for a non-numeric value', () => {
    expect(overviewQueryCodec.decode(convertToParamMap({ days: 'abc' }))).toEqual({ days: 30 })
  })

  it('omits the default from the serialised query string', () => {
    expect(overviewQueryCodec.serialize({ days: 30 })).toEqual({})
  })

  it('serialises a non-default range explicitly', () => {
    expect(overviewQueryCodec.serialize({ days: 7 })).toEqual({ days: '7' })
  })
})
