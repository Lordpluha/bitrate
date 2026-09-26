import { describe, expect, it } from 'vitest'
import type { PlayerChrome } from './index'

describe('PlayerChrome', () => {
  it.each<PlayerChrome>(['bar', 'mini', 'none'])(
    'accepts %s as a valid chrome variant',
    (chrome) => {
      const assign: PlayerChrome = chrome

      expect(assign).toBe(chrome)
    },
  )

  it('rejects a chrome variant outside the documented union at compile time', () => {
    // @ts-expect-error 'full-screen' is not a member of PlayerChrome
    const invalid: PlayerChrome = 'full-screen'

    expect(invalid).toBe('full-screen')
  })
})
