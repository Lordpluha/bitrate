import { beforeEach, describe, expect, it } from '@jest/globals'
import type { Request } from 'express'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { buildUser } from './__tests__/fixtures/users.fixtures'
import { UsersController } from './users.controller'
import type { UsersService } from './users.service'

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])

const avatarFile = (overrides: Partial<Express.Multer.File> = {}) =>
  ({
    fieldname: 'avatar',
    mimetype: 'image/png',
    size: PNG.length,
    buffer: PNG,
    ...overrides,
  }) as Express.Multer.File

describe('UsersController', () => {
  let controller: UsersController
  let service: DeepMockProxy<UsersService>

  beforeEach(() => {
    service = mockDeep<UsersService>()
    mockReset(service)

    controller = new UsersController(service)
  })

  it('getAll should reject invalid requests when username missing', async () => {
    await expect(controller.getAll(undefined, undefined, undefined)).rejects.toThrow(
      'Username query is required',
    )
  })

  it('getAll should call service with pagination', async () => {
    const users = [buildUser()]
    const response = { data: users, total: 1, page: 2, limit: 10 }
    service.findAll.mockResolvedValue(response)

    const result = await controller.getAll(10, 2, 'user')

    expect(service.findAll).toHaveBeenCalledWith({
      username: 'user',
      page: 2,
      limit: 10,
    })
    expect(result).toBe(response)
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

    const req = { user: buildUser({ id: 'user-1' }) } as unknown as Request
    const dto = { username: 'updated' }

    const result = await controller.putById(req, dto)

    expect(service.updateById).toHaveBeenCalledWith('user-1', dto)
    expect(result).toBe(updated)
  })

  it('uploadAvatar hands the uploaded file to the service for the signed-in user', async () => {
    const updated = buildUser({ avatar: '/static/users/avatars/avatar.png' })
    service.uploadAvatar.mockResolvedValue(updated)
    const req = { user: buildUser({ id: 'user-1' }) } as unknown as Request
    const file = avatarFile()

    const result = await controller.uploadAvatar(req, file)

    expect(service.uploadAvatar).toHaveBeenCalledWith('user-1', file)
    expect(result).toBe(updated)
  })

  it('uploadAvatar rejects a missing file', async () => {
    const req = { user: buildUser({ id: 'user-1' }) } as unknown as Request
    await expect(controller.uploadAvatar(req, undefined)).rejects.toThrow('Avatar file is required')
    expect(service.uploadAvatar).not.toHaveBeenCalled()
  })
})
