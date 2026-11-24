import { formatTime } from './format-time'

describe('formatTime', () => {
  it.each([
    [0, '0:00'],
    [9.7, '0:09'],
    [185, '3:05'],
    [3725, '1:02:05'],
    [-4, '0:00'],
    [Number.NaN, '0:00'],
  ])('formats %s as %s', (input, expected) => {
    expect(formatTime(input)).toBe(expected)
  })
})
