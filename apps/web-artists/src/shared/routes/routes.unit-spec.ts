import { describe, expect, it } from 'vitest'
import { PLAYER_ROUTES } from './routes'

describe('PLAYER_ROUTES', () => {
  it('links to the album page of the Bitrate player', () => {
    expect(PLAYER_ROUTES.album('0199aee0-0000-7000-8000-000000000001')).toBe(
      'http://localhost:3001/main/album/0199aee0-0000-7000-8000-000000000001',
    )
  })
})
