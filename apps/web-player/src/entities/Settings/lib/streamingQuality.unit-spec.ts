import { describe, expect, it } from 'vitest'
import {
  fromServerStreamingQuality,
  maxBitrateForQuality,
  toServerStreamingQuality,
} from './streamingQuality'

describe('streaming quality', () => {
  it('maps each choice to the server value and back', () => {
    for (const quality of ['Automatic', 'Low', 'Normal', 'High'] as const) {
      expect(
        fromServerStreamingQuality(toServerStreamingQuality(quality)),
      ).toBe(quality)
    }
    expect(toServerStreamingQuality('Automatic')).toBe('automatic')
  })

  it('reads the server-only "very-high" as High', () => {
    expect(fromServerStreamingQuality('very-high')).toBe('High')
  })

  it('caps Low and Normal and leaves High and Automatic open', () => {
    expect(maxBitrateForQuality('Low')).toBe(128)
    expect(maxBitrateForQuality('Normal')).toBe(192)
    expect(maxBitrateForQuality('High')).toBeNull()
    expect(maxBitrateForQuality('Automatic')).toBeNull()
  })
})
