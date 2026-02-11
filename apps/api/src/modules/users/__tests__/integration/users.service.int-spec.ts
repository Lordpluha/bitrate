import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import { Test, TestingModule } from '@nestjs/testing'
import 'dotenv/config'
import { UsersService } from '../../users.service'

const USER_ID = '11111111-1111-1111-1111-111111111111'
const USER_ID_2 = '22222222-2222-2222-2222-222222222222'

describe('UsersService (integration)', () => {
  let prisma: PrismaService
  let service: UsersService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, UsersService],
    }).compile()

    prisma = moduleFixture.get(PrismaService)
    service = moduleFixture.get(UsersService)

    await prisma.onModuleInit()
  })

  beforeEach(async () => {
    await prisma.userSession.deleteMany()
    await prisma.user.deleteMany()

    await prisma.user.create({
      data: {
        id: USER_ID,
        username: 'user',
        email: 'user@example.com',
        password: 'hashed-password',
        avatar: null,
        description: null,
      },
    })
  })

  afterAll(async () => {
    await prisma.userSession.deleteMany()
    await prisma.user.deleteMany()
    await prisma.onModuleDestroy()
  })

  it('findById should return user', async () => {
    const result = await service.findById(USER_ID)

    expect(result).toMatchObject({
      id: USER_ID,
      username: 'user',
    })
  })

  it('getByEmail should return user', async () => {
    const result = await service.getByEmail('user@example.com')

    expect(result).toMatchObject({
      id: USER_ID,
      email: 'user@example.com',
    })
  })

  it('getByUsername should return user', async () => {
    const result = await service.getByUsername('user')

    expect(result).toMatchObject({
      id: USER_ID,
      username: 'user',
    })
  })

  it('findAll should apply pagination', async () => {
    await prisma.user.create({
      data: {
        id: USER_ID_2,
        username: 'user2',
        email: 'user2@example.com',
        password: 'hashed-password',
        avatar: null,
        description: null,
      },
    })

    const result = await service.findAll({ username: 'user', page: 1, limit: 1 })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      username: 'user',
    })
  })

  it('create should persist user', async () => {
    const result = await service.create({
      username: 'user3',
      email: 'user3@example.com',
      password: 'hashed-password',
      avatar: null,
      description: null,
      updatedAt: new Date(),
    })

    const stored = await prisma.user.findUnique({ where: { id: result.id } })
    expect(stored).not.toBeNull()
  })

  it('updateById should persist changes', async () => {
    const result = await service.updateById(USER_ID, { username: 'updated' })

    expect(result).toMatchObject({
      id: USER_ID,
      username: 'updated',
    })

    const stored = await prisma.user.findUnique({ where: { id: USER_ID } })
    expect(stored?.username).toBe('updated')
  })

  it('uploadAvatar should persist avatar path', async () => {
    const result = await service.uploadAvatar(USER_ID, 'avatar.png')

    expect(result).toMatchObject({
      id: USER_ID,
      avatar: '/static/users/avatars/avatar.png',
    })

    const stored = await prisma.user.findUnique({ where: { id: USER_ID } })
    expect(stored?.avatar).toBe('/static/users/avatars/avatar.png')
  })
})
