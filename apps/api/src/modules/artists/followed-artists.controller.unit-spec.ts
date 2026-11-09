import { describe, expect, it, jest } from '@jest/globals'
import type { ArtistsService } from './artists.service'
import { FollowedArtistsController } from './followed-artists.controller'

describe('FollowedArtistsController', () => {
  it('lists the artists the signed-in listener follows, paginated', async () => {
    const page = { data: [], limit: 20, page: 2, total: 0 }
    const service = { getFollowing: jest.fn() } as unknown as jest.Mocked<ArtistsService>
    service.getFollowing.mockResolvedValue(page as never)
    const controller = new FollowedArtistsController(service)

    const result = await controller.list({ user: { id: 'user-1' } } as never, 2, 20)

    expect(service.getFollowing).toHaveBeenCalledWith('user-1', 2, 20)
    expect(result).toBe(page)
  })
})
