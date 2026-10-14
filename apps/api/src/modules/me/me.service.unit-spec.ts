import { beforeEach, describe, expect, it } from '@jest/globals'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { UpdateSettingsSchema } from './dtos'
import { MeService } from './me.service'

describe('MeService device activation', () => {
  let prisma: PrismaMock
  let service: MeService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new MeService(prisma)
    prisma.$transaction.mockImplementation(async (callback: unknown) => {
      if (typeof callback === 'function') {
        return await (callback as (tx: PrismaMock) => Promise<unknown>)(prisma)
      }
      return []
    })
  })

  it('validates ownership before deactivating the current device', async () => {
    prisma.playerDevice.findFirst.mockResolvedValue(null)

    await expect(
      service.upsertDevice('user-1', {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Other device',
        type: 'web',
        isActive: true,
      }),
    ).rejects.toThrow(NotFoundException)

    expect(prisma.playerDevice.updateMany).not.toHaveBeenCalled()
  })

  it('serializes deactivation and activation in one transaction', async () => {
    const device = { id: 'device-1', userId: 'user-1' }
    prisma.playerDevice.findFirst.mockResolvedValue(device as never)
    prisma.playerDevice.update.mockResolvedValue({ ...device, isActive: true } as never)

    await service.upsertDevice('user-1', {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Browser',
      type: 'web',
      isActive: true,
    })

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })
    expect(prisma.playerDevice.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { isActive: false },
    })
    expect(prisma.playerDevice.updateMany.mock.invocationCallOrder[0]).toBeLessThan(
      prisma.playerDevice.update.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
    )
  })

  it('returns 409 after exhausting retries on a unique-constraint race', async () => {
    const device = { id: 'device-1', userId: 'user-1' }
    prisma.playerDevice.findFirst.mockResolvedValue(device as never)
    prisma.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }) as never,
    )

    await expect(
      service.upsertDevice('user-1', {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Browser',
        type: 'web',
        isActive: true,
      }),
    ).rejects.toThrow(ConflictException)
    expect(prisma.$transaction).toHaveBeenCalledTimes(3)
  })
})

describe('MeService settings', () => {
  let prisma: PrismaMock
  let service: MeService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new MeService(prisma)
  })

  it('creates privacy settings open by default on first read', async () => {
    prisma.userSettings.upsert.mockResolvedValue({} as never)

    await service.getSettings('user-1')

    expect(prisma.userSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          userId: 'user-1',
          showListeningActivity: true,
          followersVisible: true,
          publicPlaylistsOnProfile: true,
          privateSession: false,
        }),
      }),
    )
  })

  it('accepts the privacy toggles and rejects non-boolean values', () => {
    expect(
      UpdateSettingsSchema.safeParse({
        showListeningActivity: false,
        followersVisible: false,
        publicPlaylistsOnProfile: false,
      }).success,
    ).toBe(true)
    expect(UpdateSettingsSchema.safeParse({ followersVisible: 'no' }).success).toBe(false)
  })
})
