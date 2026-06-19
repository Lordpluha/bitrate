import { beforeEach, describe, expect, it } from '@jest/globals'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { buildUser } from './__tests__/fixtures/users.fixtures'
import { UsersController } from './users.controller'
import type { UsersService } from './users.service'

describe('UsersController', () => {
  let controller: UsersController
  let service: DeepMockProxy<UsersService>

  beforeEach(() => {
    service = mockDeep<UsersService>()
    mockReset(service)

    controller = new UsersController(service)
  })

  it('getAll should reject when username missing', async () => {
    await expect(controller.getAll(undefined, undefined, undefined)).rejects.toThrow(
      'User not found',
    )
  })

  it('getAll should call service with pagination', async () => {
    const users = [buildUser()]
    service.findAll.mockResolvedValue(users)

    const result = await controller.getAll(10, 2, 'user')

    expect(service.findAll).toHaveBeenCalledWith({
      username: 'user',
      page: 2,
      limit: 10,
    })
    expect(result).toBe(users)
  })

  it('getByUsername should call service', async () => {
    const user = buildUser()
    service.getByUsername.mockResolvedValue(user)

    const result = await controller.getByUsername('user')

    expect(service.getByUsername).toHaveBeenCalledWith('user')
    expect(result).toBe(user)
  })

  it('getById should call service', async () => {
    const user = buildUser()
    service.findById.mockResolvedValue(user)

    const result = await controller.getById('user-1')

    expect(service.findById).toHaveBeenCalledWith('user-1')
    expect(result).toBe(user)
  })

  it('putById should use user from request', async () => {
    const updated = buildUser({ username: 'updated' })
    service.updateById.mockResolvedValue(updated)

    const req = { user: buildUser({ id: 'user-1' }) } as Request & {
      user: ReturnType<typeof buildUser>
    }
    const dto = { username: 'updated', email: 'updated@example.com' }

    const result = await controller.putById(req, dto)

    expect(service.updateById).toHaveBeenCalledWith('user-1', dto)
    expect(result).toBe(updated)
  })

  it('uploadAvatar should use file name and user from request', async () => {
    const updated = buildUser({ avatar: '/static/users/avatars/avatar.png' })
    service.uploadAvatar.mockResolvedValue(updated)

    const req = { user: buildUser({ id: 'user-1' }) } as Request & {
      user: ReturnType<typeof buildUser>
    }
    const file = { filename: 'avatar.png' } as Express.Multer.File

    const result = await controller.uploadAvatar(req, file)

    expect(service.uploadAvatar).toHaveBeenCalledWith('user-1', 'avatar.png')
    expect(result).toBe(updated)
  })
})
