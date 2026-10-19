import { beforeEach, describe, expect, it } from '@jest/globals'
import type { UserAuthRequest } from '@modules/users-auth/types'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { FriendsController } from './friends.controller'
import type { FriendsService } from './friends.service'

const req = { user: { id: 'me' } } as UserAuthRequest

describe('FriendsController', () => {
  let controller: FriendsController
  let service: DeepMockProxy<FriendsService>

  beforeEach(() => {
    service = mockDeep<FriendsService>()
    mockReset(service)
    controller = new FriendsController(service)
  })

  it('acts for the signed-in user on every route', async () => {
    await controller.list(req)
    await controller.requests(req, 'outgoing')
    await controller.send(req, 'u1')
    await controller.accept(req, 'r1')
    await controller.decline(req, 'r2')
    await controller.cancel(req, 'r3')
    await controller.remove(req, 'u2')

    expect(service.listFriends).toHaveBeenCalledWith('me')
    expect(service.listRequests).toHaveBeenCalledWith('me', 'outgoing')
    expect(service.sendRequest).toHaveBeenCalledWith('me', 'u1')
    expect(service.accept).toHaveBeenCalledWith('me', 'r1')
    expect(service.decline).toHaveBeenCalledWith('me', 'r2')
    expect(service.cancel).toHaveBeenCalledWith('me', 'r3')
    expect(service.removeFriend).toHaveBeenCalledWith('me', 'u2')
  })
})
