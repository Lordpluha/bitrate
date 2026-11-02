import { describe, expect, it } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'
import { getTargetBitrates } from './track-audio.helpers'

describe('getTargetBitrates', () => {
  it('falls back to the full ladder when the source bitrate is unknown', () => {
    expect(getTargetBitrates(0)).toEqual(['128k', '192k', '320k'])
  })

  it('never transcodes above the source bitrate', () => {
    expect(getTargetBitrates(192)).toEqual(['128k', '192k'])
  })

  it('keeps a source quieter than every rung at its own bitrate', () => {
    expect(getTargetBitrates(64)).toEqual(['64k'])
  })

  it('rejects a source below the converter minimum', () => {
    expect(() => getTargetBitrates(31)).toThrow(BadRequestException)
  })
})
