import { describe, expect, it } from 'vitest'
import { greetingKey } from './greeting'

describe('greetingKey', () => {
  it.each([
    [5, 'main.greeting.morning'],
    [11, 'main.greeting.morning'],
    [12, 'main.greeting.afternoon'],
    [17, 'main.greeting.afternoon'],
    [18, 'main.greeting.evening'],
    [23, 'main.greeting.evening'],
    [0, 'main.greeting.evening'],
    [4, 'main.greeting.evening'],
  ])('greets hour %i with %s', (hour, key) => {
    expect(greetingKey({ hour })).toBe(key)
  })
})
