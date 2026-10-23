import { describe, expect, it } from '@jest/globals'
import { EPISODE_SEARCH_MAX_LENGTH, EpisodeSearchSchema } from './episode-search.dto'

describe('EpisodeSearchSchema', () => {
  it('is optional so existing clients keep getting every episode', () => {
    expect(EpisodeSearchSchema.parse(undefined)).toBeUndefined()
  })

  it('trims surrounding whitespace', () => {
    expect(EpisodeSearchSchema.parse('  mixing  ')).toBe('mixing')
  })

  it('rejects a search longer than the maximum length', () => {
    const tooLong = 'a'.repeat(EPISODE_SEARCH_MAX_LENGTH + 1)

    expect(EpisodeSearchSchema.safeParse(tooLong).success).toBe(false)
    expect(EpisodeSearchSchema.safeParse(tooLong.slice(1)).success).toBe(true)
  })
})
