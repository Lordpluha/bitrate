import type { StorageService } from '@infra/storage/storage.types'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { ConflictException, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { AdminReleasesService } from './admin-releases.service'

const RELEASE_ID = 'release-1'
const STAFF_ID = 'staff-1'
const EXPECTED_UPDATED_AT = '2026-10-01T10:00:00.000Z'
const AUDIT = { requestId: 'req-1', ipAddress: '127.0.0.1' }

const ROW = {
  id: RELEASE_ID,
  title: 'First light',
  type: 'SINGLE',
  status: 'SUBMITTED',
  cover: null,
  submittedAt: new Date('2026-10-01T09:00:00.000Z'),
  updatedAt: new Date(EXPECTED_UPDATED_AT),
  owner: { id: 'artist-1', username: 'dj-test' },
  _count: { trackDrafts: 1 },
}

const DETAIL = {
  ...ROW,
  upc: null,
  scheduledAt: null,
  masterOwnerType: 'ARTIST',
  masterOwnerName: null,
  writersConfirmedAt: null,
  accuracyConfirmedAt: null,
  trackDrafts: [
    { id: 'draft-1', title: 'Intro', duration: 90, isrc: null, audioKey: 'k1', audioFileName: 'a' },
  ],
  contributors: [{ id: 'c1', displayName: 'DJ', roles: ['ARTIST'] }],
  splits: [],
  territories: [{ countryCode: 'DE' }, { countryCode: 'FR' }],
  destinations: [{ destination: 'SPOTIFY' }],
  reviews: [
    {
      id: 'review-1',
      decision: 'CHANGES_REQUESTED',
      message: 'Fix cover',
      requiredChanges: ['cover'],
      recommendations: [],
      createdAt: new Date(),
      staff: null,
    },
  ],
}

const READINESS_RECORD = {
  status: 'SUBMITTED',
  updatedAt: new Date(EXPECTED_UPDATED_AT),
  upc: null,
  cover: null,
  masterOwnerType: 'ARTIST',
  writersConfirmedAt: null,
  accuracyConfirmedAt: null,
  trackDrafts: [],
  tracks: [],
  contributors: [],
  splits: [],
}

describe('AdminReleasesService', () => {
  let service: AdminReleasesService
  let prisma: PrismaMock
  let transaction: DeepMockProxy<Prisma.TransactionClient>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    transaction = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation(async (callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(transaction),
    )
    service = new AdminReleasesService(prisma, mockDeep<StorageService>())
  })

  describe('detail', () => {
    it('throws NotFoundException for a missing or draft release', async () => {
      prisma.release.findFirst.mockResolvedValue(null)

      await expect(service.detail(RELEASE_ID)).rejects.toThrow(NotFoundException)
    })

    it('flattens the owner, tracks, territories, destinations and reviews', async () => {
      prisma.release.findFirst.mockResolvedValue(DETAIL as never)
      prisma.release.findFirstOrThrow.mockResolvedValue(READINESS_RECORD as never)

      const result = await service.detail(RELEASE_ID)

      expect(result).toMatchObject({
        id: RELEASE_ID,
        artistId: 'artist-1',
        artistUsername: 'dj-test',
        trackCount: 1,
        rights: { masterOwnerType: 'ARTIST', masterOwnerName: null },
        tracks: [{ id: 'draft-1', title: 'Intro', hasAudio: true }],
        territories: ['DE', 'FR'],
        destinations: ['SPOTIFY'],
        reviews: [{ id: 'review-1', reviewerUsername: null }],
      })
      expect(result.tracks[0]).not.toHaveProperty('audioKey')
      expect(result).not.toHaveProperty('owner')
      expect(result.readiness.notices).toEqual([{ code: 'UPC_MISSING' }])
      expect(prisma.release.findFirstOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: RELEASE_ID } }),
      )
    })
  })

  describe('approve / requestChanges', () => {
    it('throws NotFoundException when the release no longer exists', async () => {
      transaction.release.updateManyAndReturn.mockResolvedValue([])
      transaction.release.findFirst.mockResolvedValue(null)

      await expect(
        service.approve(RELEASE_ID, STAFF_ID, { expectedUpdatedAt: EXPECTED_UPDATED_AT }, AUDIT),
      ).rejects.toThrow(NotFoundException)
      expect(transaction.releaseReview.create).not.toHaveBeenCalled()
    })

    it('throws ConflictException when the release changed or is no longer submitted', async () => {
      transaction.release.updateManyAndReturn.mockResolvedValue([])
      transaction.release.findFirst.mockResolvedValue({ id: RELEASE_ID } as never)

      await expect(
        service.approve(RELEASE_ID, STAFF_ID, { expectedUpdatedAt: EXPECTED_UPDATED_AT }, AUDIT),
      ).rejects.toThrow(ConflictException)
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    it('records the review and the audit row when changes are requested', async () => {
      const decided = { id: RELEASE_ID, status: 'REJECTED', updatedAt: new Date() }
      transaction.release.updateManyAndReturn.mockResolvedValue([decided] as never)
      transaction.releaseReview.create.mockResolvedValue({
        id: 'review-2',
        decision: 'CHANGES_REQUESTED',
        message: 'Fix it',
        requiredChanges: ['cover'],
        recommendations: [],
        createdAt: new Date(),
        staff: { username: 'mod' },
      } as never)

      const result = await service.requestChanges(
        RELEASE_ID,
        STAFF_ID,
        {
          expectedUpdatedAt: EXPECTED_UPDATED_AT,
          message: 'Fix it',
          requiredChanges: ['cover'],
          recommendations: [],
        },
        AUDIT,
      )

      expect(result).toEqual({
        release: decided,
        review: expect.objectContaining({ id: 'review-2', reviewerUsername: 'mod' }),
      })
      expect(transaction.release.updateManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: RELEASE_ID,
            deletedAt: null,
            status: 'SUBMITTED',
            updatedAt: new Date(EXPECTED_UPDATED_AT),
          },
          data: { status: 'REJECTED' },
        }),
      )
      expect(transaction.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          staffId: STAFF_ID,
          action: 'release.request-changes',
          entityType: 'release',
          entityId: RELEASE_ID,
          ipAddress: '127.0.0.1',
          metadata: {
            reason: 'Fix it',
            before: { status: 'SUBMITTED' },
            after: { status: 'REJECTED' },
            requestId: 'req-1',
          },
        }),
      })
    })
  })
})
