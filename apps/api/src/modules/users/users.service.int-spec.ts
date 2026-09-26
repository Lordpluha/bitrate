import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import { Test, type TestingModule } from '@nestjs/testing'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import { buildUser } from './__tests__/fixtures/users.fixtures'
import { PUBLIC_USER_SELECT } from './users.select'
import { UsersService } from './users.service'

describe('UsersService (int)', () => {
  let service: UsersService
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prismaMock }],
    }).compile()

    service = module.get(UsersService)
  })

  afterAll(() => module.close())

  beforeEach(() => resetPrismaMock())

  it('should be defined via DI', () => {
    expect(service).toBeDefined()
  })

  it('findById should filter deletedAt and project only public fields', async () => {
    const user = buildUser()
    prismaMock.user.findFirst.mockResolvedValue(user as never)

    const result = await service.findById('user-1')

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'user-1', deletedAt: null },
      select: PUBLIC_USER_SELECT,
    })
    expect(result).toEqual(user)
  })

  it('findById should resolve null, not throw, for a soft-deleted user', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)

    const result = await service.findById('user-1')

    expect(result).toBeNull()
  })

  it('getByEmail should filter deletedAt and look up the id only', async () => {
    const user = buildUser()
    prismaMock.user.findFirst.mockResolvedValue(user as never)

    const result = await service.getByEmail('user@example.com')

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'user@example.com', deletedAt: null },
      select: { id: true },
    })
    expect(result).toEqual(user)
  })

  it('getByUsername should filter deletedAt and project only public fields', async () => {
    const user = buildUser()
    prismaMock.user.findFirst.mockResolvedValue(user as never)

    const result = await service.getByUsername('user')

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { username: 'user', deletedAt: null },
      select: PUBLIC_USER_SELECT,
    })
    expect(result).toEqual(user)
  })

  it('findAll should query with pagination and username filter', async () => {
    const users = [buildUser()]
    prismaMock.$transaction.mockResolvedValue([users, 1] as never)

    const result = await service.findAll({ username: 'user', page: 1, limit: 10 })

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { username: { contains: 'user', mode: 'insensitive' }, deletedAt: null },
        skip: 0,
        take: 10,
        select: PUBLIC_USER_SELECT,
      }),
    )
    expect(result).toEqual({ data: users, total: 1, page: 1, limit: 10 })
  })
})
