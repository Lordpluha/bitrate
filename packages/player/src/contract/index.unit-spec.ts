import { describe, expect, it } from 'vitest'
import { BITRATE_PLAYER_CHROMES, BITRATE_PLAYER_PART_TAG, type PlayerChrome } from './index'

describe('PlayerChrome', () => {
  it.each<PlayerChrome>(['bar', 'mini', 'expanded', 'floating', 'none'])(
    'accepts %s as a valid chrome variant',
    (chrome) => {
      const assign: PlayerChrome = chrome

      expect(BITRATE_PLAYER_CHROMES).toContain(assign)
    },
  )

  it('rejects a chrome variant outside the documented union at compile time', () => {
    // @ts-expect-error 'full-screen' is not a member of PlayerChrome
    const invalid: PlayerChrome = 'full-screen'

    expect(invalid).toBe('full-screen')
  })
})

describe('BITRATE_PLAYER_PART_TAG', () => {
  it('prefixes every part tag with the root tag, so parts never collide with host elements', () => {
    for (const tagName of Object.values(BITRATE_PLAYER_PART_TAG)) {
      expect(tagName).toMatch(/^bitrate-player-[a-z]+$/)
    }
  })
})
