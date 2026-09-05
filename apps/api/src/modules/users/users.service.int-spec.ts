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

  it('findById should project only public fields', async () => {
    const user = buildUser()
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(user as never)

    const result = await service.findById('user-1')

    expect(prismaMock.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: PUBLIC_USER_SELECT,
    })
    expect(result).toEqual(user)
  })

  it('getByEmail should look up the id only', async () => {
    const user = buildUser()
    prismaMock.user.findFirst.mockResolvedValue(user as never)

    const result = await service.getByEmail('user@example.com')

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      select: { id: true },
    })
    expect(result).toEqual(user)
  })

  it('getByUsername should project only public fields', async () => {
    const user = buildUser()
    prismaMock.user.findFirst.mockResolvedValue(user as never)

    const result = await service.getByUsername('user')

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { username: 'user' },
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
