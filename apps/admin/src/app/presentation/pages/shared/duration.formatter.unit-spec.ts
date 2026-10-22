import { describe, expect, it } from 'vitest'
import { formatClockDuration, formatMinutes, humaniseDurationMs } from './duration.formatter'

describe('duration formatters', () => {
  it('humanises a processing duration in ms, seconds or minutes', () => {
    expect(humaniseDurationMs(820)).toBe('820ms')
    expect(humaniseDurationMs(42_000)).toBe('42s')
    expect(humaniseDurationMs(598_000)).toBe('9m 58s')
  })

  it('shows a recording length as a zero-padded clock', () => {
    expect(formatClockDuration(187)).toBe('3:07')
    expect(formatClockDuration(0)).toBe('0:00')
    expect(formatClockDuration(null)).toBe('—')
  })

  it('shows an episode length in whole minutes', () => {
    expect(formatMinutes(1800)).toBe('30 min')
    expect(formatMinutes(89)).toBe('1 min')
    expect(formatMinutes(null)).toBe('—')
  })
})
