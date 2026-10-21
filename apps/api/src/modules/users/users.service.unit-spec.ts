import { LEGAL_VERSION } from '@common/legal'
import type { StorageService } from '@infra/storage/storage.types'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { NotificationsProducer } from '@modules/notifications'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildUser } from './__tests__/fixtures/users.fixtures'
import { PUBLIC_USER_SELECT, SELF_USER_SELECT } from './users.select'
import { UsersService } from './users.service'

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])

const avatarFile = (overrides: Partial<Express.Multer.File> = {}) =>
  ({
    fieldname: 'avatar',
    mimetype: 'image/png',
    size: PNG.length,
    buffer: PNG,
    ...overrides,
  }) as Express.Multer.File

describe('UsersService', () => {
  let service: UsersService
  let prisma: PrismaMock
  let producer: jest.Mocked<NotificationsProducer>
  let storage: jest.Mocked<StorageService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    producer = {
      followed: jest.fn(async () => undefined),
    } as unknown as jest.Mocked<NotificationsProducer>
    storage = {
      upload: jest.fn().mockImplementation(async (key: unknown) => key as never),
      deleteObject: jest.fn().mockResolvedValue(undefined as never),
    } as unknown as jest.Mocked<StorageService>
    service = new UsersService(prisma, producer, storage)
  })

  it('findById should filter deletedAt and select the public projection', async () => {
    const user = buildUser()
    prisma.user.findFirst.mockResolvedValue(user)

    const result = await service.findById('user-1')

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'user-1', deletedAt: null },
      select: PUBLIC_USER_SELECT,
    })
    expect(result).toBe(user)
  })

  it('findById should resolve null for a soft-deleted user, not throw', async () => {
    prisma.user.findFirst.mockResolvedValue(null)

    const result = await service.findById('user-1')

    expect(result).toBeNull()
  })

  describe('findSelfById legal acceptance', () => {
    it.each([
      ['never recorded', null],
      ['an older revision', '2020-01-01'],
    ])('flags acceptance as required when the account has %s', async (_label, legalVersion) => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(buildUser({ legalVersion }) as never)

      const result = await service.findSelfById('user-1')

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: SELF_USER_SELECT,
      })
      expect(result.legalAcceptanceRequired).toBe(true)
    })

    it('does not flag an account that accepted the current revision', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(
        buildUser({ legalVersion: LEGAL_VERSION }) as never,
      )

      const result = await service.findSelfById('user-1')

      expect(result.legalAcceptanceRequired).toBe(false)
    })
  })

  describe('acceptLegal', () => {
    it('records the current revision and time, then returns the refreshed account', async () => {
      prisma.user.update.mockResolvedValue(buildUser() as never)
      prisma.user.findUniqueOrThrow.mockResolvedValue(
        buildUser({ legalVersion: LEGAL_VERSION }) as never,
      )

      const result = await service.acceptLegal('user-1')

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { legalVersion: LEGAL_VERSION, legalAcceptedAt: expect.any(Date) },
        select: { id: true },
      })
      expect(result.legalAcceptanceRequired).toBe(false)
    })
  })

  it('getByEmail should filter deletedAt and omit password', async () => {
    const user = buildUser()
    prisma.user.findFirst.mockResolvedValue(user)

    const result = await service.getByEmail('user@example.com')

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'user@example.com', deletedAt: null },
      select: { id: true },
    })
    expect(result).toBe(user)
  })

  it('getByUsername should filter deletedAt and omit password and email', async () => {
    const user = buildUser()
    prisma.user.findFirst.mockResolvedValue(user)

    const result = await service.getByUsername('user')

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { username: 'user', deletedAt: null },
      select: PUBLIC_USER_SELECT,
    })
    expect(result).toBe(user)
  })

  it('findAll should use pagination', async () => {
    const users = [buildUser()]
    prisma.$transaction.mockResolvedValue([users, 1] as never)

    const result = await service.findAll({ username: 'user', page: 2, limit: 5 })

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        username: { contains: 'user', mode: 'insensitive' },
        deletedAt: null,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 5,
      take: 5,
      select: PUBLIC_USER_SELECT,
    })
    expect(result).toEqual({ data: users, total: 1, page: 2, limit: 5 })
  })

  it('create should omit password and twoFactorSecret in result', async () => {
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
      select: { id: true, email: true, username: true },
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
      select: PUBLIC_USER_SELECT,
    })
    expect(result).toBe(updated)
  })

  describe('uploadAvatar', () => {
    it('stores the image and saves its generated path for the user', async () => {
      prisma.user.findUnique.mockResolvedValue({ avatar: null } as never)
      const updated = buildUser({ avatar: '/static/users/avatars/avatar.png' })
      prisma.user.update.mockResolvedValue(updated)

      const result = await service.uploadAvatar('user-1', avatarFile())

      const key = storage.upload.mock.calls[0]?.[0] as string
      expect(key).toMatch(/^users\/avatars\/[0-9a-f-]{36}\.png$/)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { avatar: `/static/${key}` },
        select: PUBLIC_USER_SELECT,
      })
      expect(storage.deleteObject).not.toHaveBeenCalled()
      expect(result).toBe(updated)
    })

    it('rejects spoofed content without uploading anything', async () => {
      prisma.user.findUnique.mockResolvedValue({ avatar: null } as never)
      const spoofed = avatarFile({ buffer: Buffer.from('<script>bad', 'ascii') })

      await expect(service.uploadAvatar('user-1', spoofed)).rejects.toThrow(
        'Invalid image file content',
      )

      expect(storage.upload).not.toHaveBeenCalled()
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('removes the stored image when saving it fails', async () => {
      prisma.user.findUnique.mockResolvedValue({ avatar: null } as never)
      prisma.user.update.mockRejectedValue(new Error('database unavailable'))

      await expect(service.uploadAvatar('user-1', avatarFile())).rejects.toThrow(
        'database unavailable',
      )

      const key = storage.upload.mock.calls[0]?.[0] as string
      expect(storage.deleteObject).toHaveBeenCalledWith(key)
    })

    it('deletes the previous stored avatar once the new one is saved', async () => {
      prisma.user.findUnique.mockResolvedValue({
        avatar: '/static/users/avatars/old-avatar.png',
      } as never)
      prisma.user.update.mockResolvedValue(buildUser())

      await service.uploadAvatar('user-1', avatarFile())

      expect(storage.deleteObject).toHaveBeenCalledTimes(1)
      expect(storage.deleteObject).toHaveBeenCalledWith('users/avatars/old-avatar.png')
    })

    it('leaves a previous avatar it does not own in storage', async () => {
      prisma.user.findUnique.mockResolvedValue({
        avatar: 'https://cdn.example.com/avatar.png',
      } as never)
      prisma.user.update.mockResolvedValue(buildUser())

      await service.uploadAvatar('user-1', avatarFile())

      expect(storage.deleteObject).not.toHaveBeenCalled()
    })

    it('keeps the new avatar when removing the previous one fails', async () => {
      prisma.user.findUnique.mockResolvedValue({
        avatar: '/static/users/avatars/old-avatar.png',
      } as never)
      const updated = buildUser()
      prisma.user.update.mockResolvedValue(updated)
      storage.deleteObject.mockRejectedValue(new Error('storage down') as never)

      await expect(service.uploadAvatar('user-1', avatarFile())).resolves.toBe(updated)
    })
  })

  describe('follower lists', () => {
    const target = 'user-2'

    it('lists who follows a user whose lists are visible', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: target } as never)
      prisma.userSettings.findUnique.mockResolvedValue({ followersVisible: true } as never)
      prisma.$transaction.mockResolvedValue([[], 0] as never)

      const result = await service.listFollows('followers', target, 'viewer-1', 1, 20)

      expect(prisma.userFollow.findMany).toHaveBeenCalledWith({
        where: { followingId: target, follower: { deletedAt: null } },
        orderBy: [{ createdAt: 'desc' }, { followerId: 'asc' }],
        skip: 0,
        take: 20,
        include: { follower: { select: PUBLIC_USER_SELECT } },
      })
      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 })
    })

    it('lists whom a user follows', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: target } as never)
      prisma.userSettings.findUnique.mockResolvedValue(null)
      prisma.$transaction.mockResolvedValue([[], 0] as never)

      await service.listFollows('following', target, undefined, 1, 20)

      expect(prisma.userFollow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { followerId: target, following: { deletedAt: null } },
          include: { following: { select: PUBLIC_USER_SELECT } },
        }),
      )
    })

    it('forbids other people from listing hidden followers', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: target } as never)
      prisma.userSettings.findUnique.mockResolvedValue({ followersVisible: false } as never)

      await expect(
        service.listFollows('followers', target, 'viewer-1', 1, 20),
      ).rejects.toBeInstanceOf(ForbiddenException)
      expect(prisma.userFollow.findMany).not.toHaveBeenCalled()
    })

    it('always lets the owner see their own lists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: target } as never)
      prisma.$transaction.mockResolvedValue([[], 0] as never)

      await service.listFollows('followers', target, target, 1, 20)

      expect(prisma.userSettings.findUnique).not.toHaveBeenCalled()
      expect(prisma.userFollow.findMany).toHaveBeenCalled()
    })

    it('throws NotFound for an unknown or deleted user', async () => {
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(
        service.listFollows('following', target, undefined, 1, 20),
      ).rejects.toBeInstanceOf(NotFoundException)
    })
  })

  describe('friend activity', () => {
    it('returns each followed person latest listen, newest first, from people who share it', async () => {
      const now = Date.UTC(2026, 9, 14, 12)
      jest.spyOn(Date, 'now').mockReturnValue(now)
      const at = (m: number) => new Date(now - m * 60_000)
      prisma.queryRaw.mockResolvedValue([
        { userId: 'friend-1', trackId: 'track-1', listenedAt: at(5) },
        { userId: 'friend-2', trackId: 'track-2', listenedAt: at(1) },
      ] as never)
      prisma.user.findMany.mockResolvedValue([
        { id: 'friend-1', username: 'one' },
        { id: 'friend-2', username: 'two' },
      ] as never)
      prisma.track.findMany.mockResolvedValue([
        { id: 'track-1', title: 'A' },
        { id: 'track-2', title: 'B' },
      ] as never)

      const result = await service.getFollowingActivity('me-1', 10)

      const query = prisma.queryRaw.mock.calls[0]?.[0] as Prisma.Sql
      const sql = query.strings.join(' ')
      expect(sql).toContain('DISTINCT ON (h."userId")')
      expect(sql).toContain('JOIN "UserFollow" f ON f."followingId" = h."userId"')
      expect(sql).toContain('COALESCE(s."showListeningActivity", true)')
      expect(sql).toContain('u."deletedAt" IS NULL')
      expect(sql).toContain('t."processingStatus" = \'READY\'')
      expect(query.values).toContain('me-1')
      expect(query.values).toContainEqual(new Date(now - 7 * 24 * 60 * 60 * 1000))
      expect(query.values).toContain(10)
      expect(result.map(({ user, track }) => [user.id, track.id])).toEqual([
        ['friend-1', 'track-1'],
        ['friend-2', 'track-2'],
      ])
      jest.restoreAllMocks()
    })
  })

  describe('followUser', () => {
    it('notifies the followed user about a new follow', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'b' } as never)
      prisma.userFollow.findUnique.mockResolvedValue(null)
      prisma.userFollow.upsert.mockResolvedValue({} as never)

      await service.followUser('a', 'b')

      expect(prisma.userFollow.upsert).toHaveBeenCalled()
      expect(producer.followed).toHaveBeenCalledWith({ followerId: 'a', followingId: 'b' })
    })

    it('does not notify again for a follow that already existed', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'b' } as never)
      prisma.userFollow.findUnique.mockResolvedValue({ followerId: 'a' } as never)

      await service.followUser('a', 'b')

      expect(producer.followed).not.toHaveBeenCalled()
    })

    it('still follows when the notification cannot be queued', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'b' } as never)
      prisma.userFollow.findUnique.mockResolvedValue(null)
      prisma.userFollow.upsert.mockResolvedValue({} as never)
      producer.followed.mockRejectedValue(new Error('redis down'))

      await expect(service.followUser('a', 'b')).resolves.toBeUndefined()
      expect(prisma.userFollow.upsert).toHaveBeenCalled()
    })
  })
})
