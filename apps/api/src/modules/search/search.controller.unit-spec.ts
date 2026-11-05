import { beforeEach, describe, expect, it } from '@jest/globals'
import { buildUser } from '@modules/users/__tests__/fixtures/users.fixtures'
import { BadRequestException } from '@nestjs/common'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { SearchController } from './search.controller'
import type { SearchService } from './search.service'

const makeUser = (userId?: string) => (userId ? buildUser({ id: userId }) : undefined)

describe('SearchController', () => {
  let controller: SearchController
  let service: DeepMockProxy<SearchService>

  beforeEach(() => {
    service = mockDeep<SearchService>()
    mockReset(service)
    controller = new SearchController(service)
  })

  it('rejects a blank query before it ever reaches the search service', async () => {
    await expect(controller.search(makeUser(), '   ')).rejects.toThrow(BadRequestException)
    expect(service.search).not.toHaveBeenCalled()
  })

  it('rejects a search type outside the known allowlist', async () => {
    await expect(controller.search(makeUser(), 'query', 'not-a-real-type')).rejects.toThrow(
      BadRequestException,
    )
    expect(service.search).not.toHaveBeenCalled()
  })

  it('searches anonymously — userId is undefined when no session is present', async () => {
    service.search.mockResolvedValue({
      tracks: [],
      albums: [],
      artists: [],
      playlists: [],
    } as never)

    await controller.search(makeUser(), ' query ', 'tracks')

    expect(service.search).toHaveBeenCalledWith(
      'query',
      expect.objectContaining({ types: ['tracks'], userId: undefined }),
    )
  })

  it('forwards the authenticated user id so search history can be recorded', async () => {
    service.search.mockResolvedValue({
      tracks: [],
      albums: [],
      artists: [],
      playlists: [],
    } as never)

    await controller.search(makeUser('user-1'), 'query')

    expect(service.search).toHaveBeenCalledWith(
      'query',
      expect.objectContaining({ userId: 'user-1' }),
    )
  })
})
