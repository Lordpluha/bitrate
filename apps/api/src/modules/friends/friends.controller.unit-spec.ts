import { beforeEach, describe, expect, it } from '@jest/globals'
import { buildUser } from '@modules/users/__tests__/fixtures/users.fixtures'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { FriendsController } from './friends.controller'
import type { FriendsService } from './friends.service'

const user = buildUser({ id: 'me' })

describe('FriendsController', () => {
  let controller: FriendsController
  let service: DeepMockProxy<FriendsService>

  beforeEach(() => {
    service = mockDeep<FriendsService>()
    mockReset(service)
    controller = new FriendsController(service)
  })

  it('acts for the signed-in user on every route', async () => {
    await controller.list(user)
    await controller.requests(user, 'outgoing')
    await controller.send(user, 'u1')
    await controller.accept(user, 'r1')
    await controller.decline(user, 'r2')
    await controller.cancel(user, 'r3')
    await controller.remove(user, 'u2')

    expect(service.listFriends).toHaveBeenCalledWith('me')
    expect(service.listRequests).toHaveBeenCalledWith('me', 'outgoing')
    expect(service.sendRequest).toHaveBeenCalledWith('me', 'u1')
    expect(service.accept).toHaveBeenCalledWith('me', 'r1')
    expect(service.decline).toHaveBeenCalledWith('me', 'r2')
    expect(service.cancel).toHaveBeenCalledWith('me', 'r3')
    expect(service.removeFriend).toHaveBeenCalledWith('me', 'u2')
  })
})
