import { beforeEach, describe, expect, it } from '@jest/globals'
import { PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildUser } from './__tests__/fixtures/users.fixtures'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new UsersService(prisma)
  })

  it('findById should call prisma with omit', async () => {
    const user = buildUser()
    prisma.user.findUniqueOrThrow.mockResolvedValue(user)

    const result = await service.findById('user-1')

    expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      omit: { password: true, email: true },
    })
    expect(result).toBe(user)
  })

  it('getByEmail should call prisma with omit password', async () => {
    const user = buildUser()
    prisma.user.findFirst.mockResolvedValue(user)

    const result = await service.getByEmail('user@example.com')

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      omit: { password: true },
    })
    expect(result).toBe(user)
  })

  it('getByUsername should call prisma with omit password and email', async () => {
    const user = buildUser()
    prisma.user.findFirst.mockResolvedValue(user)

    const result = await service.getByUsername('user')

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { username: 'user' },
      omit: { password: true, email: true },
    })
    expect(result).toBe(user)
  })

  it('findAll should use pagination', async () => {
    const users = [buildUser()]
    prisma.user.findMany.mockResolvedValue(users)

    const result = await service.findAll({ username: 'user', page: 2, limit: 5 })

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { username: 'user' },
      skip: 5,
      take: 5,
      omit: { password: true, email: true },
    })
    expect(result).toBe(users)
  })

  it('create should omit password in result', async () => {
    const created = buildUser()
    prisma.user.create.mockResolvedValue(created)

    const result = await service.create({
      username: 'user',
      email: 'user@example.com',
      password: 'hashed-password',
      avatar: null,
      description: null,
      updatedAt: created.updatedAt,
    })

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        username: 'user',
        email: 'user@example.com',
        password: 'hashed-password',
        avatar: null,
        description: null,
        updatedAt: created.updatedAt,
      },
      omit: { password: true },
    })
    expect(result).toBe(created)
  })

  it('updateById should call prisma with omit password', async () => {
    const updated = buildUser({ username: 'updated' })
    prisma.user.update.mockResolvedValue(updated)

    const result = await service.updateById('user-1', { username: 'updated' })

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { username: 'updated' },
      omit: { password: true },
    })
    expect(result).toBe(updated)
  })

  it('uploadAvatar should set avatar path', async () => {
    const updated = buildUser({ avatar: '/static/users/avatars/avatar.png' })
    prisma.user.update.mockResolvedValue(updated)

    const result = await service.uploadAvatar('user-1', 'avatar.png')

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { avatar: '/static/users/avatars/avatar.png' },
      omit: { password: true },
    })
    expect(result).toBe(updated)
  })
})
