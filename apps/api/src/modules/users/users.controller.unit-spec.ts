import { unlink } from 'node:fs/promises'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { Request } from 'express'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { buildUser } from './__tests__/fixtures/users.fixtures'
import { UsersController } from './users.controller'
import type { UsersService } from './users.service'

const unlinkMock = unlink as jest.MockedFunction<typeof unlink>

jest.mock('node:fs/promises', () => ({
  open: jest.fn().mockResolvedValue({
    read: jest.fn().mockImplementation((buf: unknown) => {
      const b = buf as Buffer
      // PNG magic bytes
      b[0] = 0x89
      b[1] = 0x50
      b[2] = 0x4e
      b[3] = 0x47
      return Promise.resolve()
    }),
    close: jest.fn().mockResolvedValue(null as never),
  } as never),
  unlink: jest.fn().mockResolvedValue(null as never),
}))

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

  it('uploadAvatar should use file name and user from request', async () => {
    const updated = buildUser({ avatar: '/static/users/avatars/avatar.png' })
    service.uploadAvatar.mockResolvedValue(updated)

    const req = { user: buildUser({ id: 'user-1' }) } as unknown as Request
    const file = {
      filename: 'avatar.png',
      path: '/tmp/avatar.png',
      mimetype: 'image/png',
    } as Express.Multer.File

    const result = await controller.uploadAvatar(req, file)

    expect(service.uploadAvatar).toHaveBeenCalledWith('user-1', 'avatar.png')
    expect(result).toBe(updated)
  })

  it('removes a validated avatar when persisting it fails', async () => {
    service.uploadAvatar.mockRejectedValue(new Error('database unavailable'))
    const req = { user: buildUser({ id: 'user-1' }) } as unknown as Request
    const file = {
      filename: 'avatar.png',
      path: '/tmp/avatar.png',
      mimetype: 'image/png',
    } as Express.Multer.File

    await expect(controller.uploadAvatar(req, file)).rejects.toThrow('database unavailable')

    expect(unlinkMock).toHaveBeenCalledWith(file.path)
  })
})
