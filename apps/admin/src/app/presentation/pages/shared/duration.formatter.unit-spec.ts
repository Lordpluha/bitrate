import { describe, expect, it } from 'vitest'
import { formatClockDuration, humaniseDurationMs, wholeMinutes } from './duration.formatter'

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

  it('counts an episode length in whole minutes, never zero', () => {
    expect(wholeMinutes(1800)).toBe(30)
    expect(wholeMinutes(89)).toBe(1)
    expect(wholeMinutes(20)).toBe(1)
    expect(wholeMinutes(null)).toBeNull()
  })
})
