import { beforeEach, describe, expect, it } from '@jest/globals'
import { ConflictException, NotFoundException } from '@nestjs/common'
import {
  makeCacheMock,
  makeStorageMock,
  type PrismaMock,
  prismaMock,
  resetPrismaMock,
} from '@test/mocks'
import { ArtistProfileService } from './artist-profile.service'

const version = new Date('2026-10-29T10:00:00.000Z')

const record = (overrides: { locale?: string; updatedAt?: Date } = {}) => ({
  id: 'artist-1',
  username: 'artist',
  email: 'artist@example.com',
  bio: null,
  country: null,
  socials: null,
  avatar: null,
  backgroundImage: null,
  verified: false,
  twoFactorEnabled: false,
  emailVerifiedAt: version,
  locale: 'en',
  updatedAt: version,
  ...overrides,
})

describe('ArtistProfileService.setLocale', () => {
  let service: ArtistProfileService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new ArtistProfileService(prisma, makeCacheMock(), makeStorageMock())
  })

  it('stores the language without advancing the profile version', async () => {
    prisma.artist.findFirst.mockResolvedValue(record() as never)
    prisma.artist.updateManyAndReturn.mockResolvedValue([record({ locale: 'pl' })] as never)

    const profile = await service.setLocale('artist-1', 'pl')

    expect(prisma.artist.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'artist-1', deletedAt: null, updatedAt: version },
        data: { locale: 'pl', updatedAt: version },
      }),
    )
    expect(profile).toMatchObject({ locale: 'pl', updatedAt: version })
  })

  it('tries again when the profile was edited between the read and the write', async () => {
    const edited = new Date('2026-10-29T10:00:05.000Z')
    prisma.artist.findFirst
      .mockResolvedValueOnce(record() as never)
      .mockResolvedValueOnce(record({ updatedAt: edited }) as never)
    prisma.artist.updateManyAndReturn
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([record({ locale: 'uk', updatedAt: edited })] as never)

    await expect(service.setLocale('artist-1', 'uk')).resolves.toMatchObject({
      locale: 'uk',
      updatedAt: edited,
    })
    expect(prisma.artist.updateManyAndReturn).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { locale: 'uk', updatedAt: edited } }),
    )
  })

  it('gives up with a conflict when the profile keeps changing', async () => {
    prisma.artist.findFirst.mockResolvedValue(record() as never)
    prisma.artist.updateManyAndReturn.mockResolvedValue([] as never)

    await expect(service.setLocale('artist-1', 'uk')).rejects.toBeInstanceOf(ConflictException)
  })

  it('reports a deleted artist as not found', async () => {
    prisma.artist.findFirst.mockResolvedValue(null)

    await expect(service.setLocale('artist-1', 'uk')).rejects.toBeInstanceOf(NotFoundException)
    expect(prisma.artist.updateManyAndReturn).not.toHaveBeenCalled()
  })
})
