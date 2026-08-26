import { beforeEach, describe, expect, it } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
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
})
