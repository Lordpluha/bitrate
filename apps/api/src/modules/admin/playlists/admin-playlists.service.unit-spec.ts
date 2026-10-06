import { beforeEach, describe, expect, it } from '@jest/globals'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { buildPlaylistWithOwner } from './__tests__/fixtures/admin-playlists.fixtures'
import { AdminPlaylistsService } from './admin-playlists.service'
import {
  PlaylistAlreadyDeletedException,
  PlaylistAlreadyHiddenException,
  PlaylistAlreadyPublicException,
  PlaylistNotDeletedException,
  PlaylistNotFoundException,
  PlaylistNotHiddenByOperatorException,
} from './errors'

const STAFF_ID = 'staff-1'

describe('AdminPlaylistsService', () => {
  let service: AdminPlaylistsService
  let prisma: PrismaMock
  let transaction: DeepMockProxy<Prisma.TransactionClient>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    transaction = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation((callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(transaction),
    )
    service = new AdminPlaylistsService(prisma)
  })

  describe('findAll', () => {
    it('returns a flattened page of public playlists filtered by q and ownerId', async () => {
      prisma.playlist.findMany.mockResolvedValue([buildPlaylistWithOwner()] as never)
      prisma.playlist.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 2, limit: 5, q: 'night', ownerId: 'user-1' })

      expect(result).toMatchObject({ total: 1, page: 2, limit: 5 })
      expect(result.data[0]).toMatchObject({
        id: 'playlist-1',
        ownerId: 'user-1',
        ownerUsername: 'listener',
        trackCount: 2,
      })
      expect(result.data[0]).not.toHaveProperty('user')
      expect(result.data[0]).not.toHaveProperty('_count')
      expect(prisma.playlist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublic: true,
            deletedAt: null,
            userId: 'user-1',
            title: { contains: 'night', mode: 'insensitive' },
          }),
          skip: 5,
          take: 5,
        }),
      )
    })

    it('never lists private playlists, whatever the status filter', async () => {
      prisma.playlist.findMany.mockResolvedValue([] as never)
      prisma.playlist.count.mockResolvedValue(0)

      for (const status of [undefined, 'active', 'deactivated', 'all'] as const) {
        await service.findAll({ status })
      }

      for (const [args] of prisma.playlist.findMany.mock.calls) {
        expect(args?.where).toMatchObject({ isPublic: true })
      }
      for (const [args] of prisma.playlist.count.mock.calls) {
        expect(args?.where).toMatchObject({ isPublic: true })
      }
    })

    it('excludes taken-down playlists by default', async () => {
      prisma.playlist.findMany.mockResolvedValue([] as never)
      prisma.playlist.count.mockResolvedValue(0)

      await service.findAll({})

      expect(prisma.playlist.findMany.mock.calls[0]?.[0]?.where).toMatchObject({ deletedAt: null })
    })

    it('status=deactivated lists only taken-down playlists', async () => {
      prisma.playlist.findMany.mockResolvedValue([] as never)
      prisma.playlist.count.mockResolvedValue(0)

      await service.findAll({ status: 'deactivated' })

      expect(prisma.playlist.findMany.mock.calls[0]?.[0]?.where).toMatchObject({
        deletedAt: { not: null },
      })
    })

    it('status=all drops the deletedAt filter', async () => {
      prisma.playlist.findMany.mockResolvedValue([] as never)
      prisma.playlist.count.mockResolvedValue(0)

      await service.findAll({ status: 'all' })

      expect(prisma.playlist.findMany.mock.calls[0]?.[0]?.where).not.toHaveProperty('deletedAt')
    })

    it('orders by createdAt desc with an id tie-break when no sort is given', async () => {
      prisma.playlist.findMany.mockResolvedValue([] as never)
      prisma.playlist.count.mockResolvedValue(0)

      await service.findAll({})

      expect(prisma.playlist.findMany.mock.calls[0]?.[0]?.orderBy).toEqual([
        { createdAt: 'desc' },
        { id: 'desc' },
      ])
    })

    it('orders by the chosen field with a matching-direction id tie-break', async () => {
      prisma.playlist.findMany.mockResolvedValue([] as never)
      prisma.playlist.count.mockResolvedValue(0)

      await service.findAll({ sort: 'title', order: 'asc' })

      expect(prisma.playlist.findMany.mock.calls[0]?.[0]?.orderBy).toEqual([
        { title: 'asc' },
        { id: 'asc' },
      ])
    })
  })

  describe('findById', () => {
    it('throws PlaylistNotFoundException when the playlist does not exist', async () => {
      prisma.playlist.findFirst.mockResolvedValue(null)

      await expect(service.findById('missing')).rejects.toThrow(PlaylistNotFoundException)
    })

    it('returns a hidden, taken-down playlist with owner and tracks flattened', async () => {
      prisma.playlist.findFirst.mockResolvedValue({
        ...buildPlaylistWithOwner({ isPublic: false, deletedAt: new Date('2026-02-01T00:00:00Z') }),
        tracks: [{ position: 0, track: { id: 'track-1', title: 'Intro' } }],
      } as never)

      const result = await service.findById('playlist-1')

      expect(result).toMatchObject({
        isPublic: false,
        ownerId: 'user-1',
        ownerUsername: 'listener',
        trackCount: 2,
        followersCount: 3,
        deletedAt: new Date('2026-02-01T00:00:00Z'),
      })
      expect(result.tracks).toEqual([{ id: 'track-1', title: 'Intro', position: 0 }])
    })

    it('does not filter by visibility or deletedAt and takes the first 50 tracks in order', async () => {
      prisma.playlist.findFirst.mockResolvedValue({
        ...buildPlaylistWithOwner(),
        tracks: [],
      } as never)

      await service.findById('playlist-1')

      const call = prisma.playlist.findFirst.mock.calls[0]?.[0]
      expect(call?.where).toEqual({ id: 'playlist-1' })
      expect(call?.select).toMatchObject({
        tracks: expect.objectContaining({ orderBy: { position: 'asc' }, take: 50 }),
      })
    })
  })

  describe('setVisibility', () => {
    it('throws PlaylistNotFoundException when the playlist does not exist', async () => {
      prisma.playlist.findFirst.mockResolvedValue(null)

      await expect(service.setVisibility('missing', false, STAFF_ID)).rejects.toThrow(
        PlaylistNotFoundException,
      )
    })

    it('throws PlaylistAlreadyHiddenException when hiding a private playlist', async () => {
      prisma.playlist.findFirst.mockResolvedValue(
        buildPlaylistWithOwner({ isPublic: false }) as never,
      )

      await expect(service.setVisibility('playlist-1', false, STAFF_ID)).rejects.toThrow(
        PlaylistAlreadyHiddenException,
      )
    })

    it('throws PlaylistAlreadyHiddenException when a concurrent hide wins the race', async () => {
      prisma.playlist.findFirst.mockResolvedValue(buildPlaylistWithOwner() as never)
      transaction.playlist.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.setVisibility('playlist-1', false, STAFF_ID)).rejects.toThrow(
        PlaylistAlreadyHiddenException,
      )
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    /** AC1: hiding forces private and nothing else — the playlist is not deleted. */
    it('hides by setting only isPublic=false, audits it, and leaves deletedAt alone', async () => {
      prisma.playlist.findFirst.mockResolvedValue(buildPlaylistWithOwner() as never)
      transaction.playlist.updateMany.mockResolvedValue({ count: 1 })
      transaction.playlist.findFirstOrThrow.mockResolvedValue(
        buildPlaylistWithOwner({ isPublic: false }) as never,
      )

      const result = await service.setVisibility('playlist-1', false, STAFF_ID, 'misleading')

      expect(transaction.playlist.updateMany).toHaveBeenCalledWith({
        where: { id: 'playlist-1', isPublic: true },
        data: { isPublic: false },
      })
      expect(transaction.playlist.delete).not.toHaveBeenCalled()
      expect(result).toMatchObject({ isPublic: false, deletedAt: null })
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'admin-playlists.hide',
            entityType: 'admin-playlists',
            entityId: 'playlist-1',
            metadata: expect.objectContaining({
              reason: 'misleading',
              before: { isPublic: true },
              after: { isPublic: false },
            }),
          }),
        }),
      )
    })

    it('throws PlaylistAlreadyPublicException when unhiding a public playlist', async () => {
      prisma.playlist.findFirst.mockResolvedValue(buildPlaylistWithOwner() as never)

      await expect(service.setVisibility('playlist-1', true, STAFF_ID)).rejects.toThrow(
        PlaylistAlreadyPublicException,
      )
    })

    it('refuses to publish a playlist its owner made private (no operator hide on record)', async () => {
      prisma.playlist.findFirst.mockResolvedValue(
        buildPlaylistWithOwner({ isPublic: false }) as never,
      )
      prisma.auditLog.findFirst.mockResolvedValue(null)

      await expect(service.setVisibility('playlist-1', true, STAFF_ID)).rejects.toThrow(
        PlaylistNotHiddenByOperatorException,
      )
      expect(transaction.playlist.updateMany).not.toHaveBeenCalled()
    })

    it('refuses to unhide when the latest operator visibility action was an unhide', async () => {
      prisma.playlist.findFirst.mockResolvedValue(
        buildPlaylistWithOwner({ isPublic: false }) as never,
      )
      prisma.auditLog.findFirst.mockResolvedValue({ action: 'admin-playlists.unhide' } as never)

      await expect(service.setVisibility('playlist-1', true, STAFF_ID)).rejects.toThrow(
        PlaylistNotHiddenByOperatorException,
      )
    })

    /** AC2 (independence): unhide sets only isPublic and never touches deletedAt. */
    it('unhides an operator-hidden playlist by setting only isPublic=true', async () => {
      const deletedAt = new Date('2026-02-01T00:00:00Z')
      prisma.playlist.findFirst.mockResolvedValue(
        buildPlaylistWithOwner({ isPublic: false, deletedAt }) as never,
      )
      prisma.auditLog.findFirst.mockResolvedValue({ action: 'admin-playlists.hide' } as never)
      transaction.playlist.updateMany.mockResolvedValue({ count: 1 })
      transaction.playlist.findFirstOrThrow.mockResolvedValue(
        buildPlaylistWithOwner({ isPublic: true, deletedAt }) as never,
      )

      const result = await service.setVisibility('playlist-1', true, STAFF_ID)

      expect(prisma.auditLog.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            entityType: 'admin-playlists',
            entityId: 'playlist-1',
          }),
          orderBy: { createdAt: 'desc' },
        }),
      )
      expect(transaction.playlist.updateMany).toHaveBeenCalledWith({
        where: { id: 'playlist-1', isPublic: false },
        data: { isPublic: true },
      })
      expect(result).toMatchObject({ isPublic: true, deletedAt })
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'admin-playlists.unhide' }),
        }),
      )
    })

    it('throws PlaylistAlreadyPublicException when a concurrent unhide wins the race', async () => {
      prisma.playlist.findFirst.mockResolvedValue(
        buildPlaylistWithOwner({ isPublic: false }) as never,
      )
      prisma.auditLog.findFirst.mockResolvedValue({ action: 'admin-playlists.hide' } as never)
      transaction.playlist.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.setVisibility('playlist-1', true, STAFF_ID)).rejects.toThrow(
        PlaylistAlreadyPublicException,
      )
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })
  })

  describe('softDelete', () => {
    it('throws PlaylistNotFoundException when the playlist does not exist', async () => {
      prisma.playlist.findFirst.mockResolvedValue(null)

      await expect(service.softDelete('missing', STAFF_ID)).rejects.toThrow(
        PlaylistNotFoundException,
      )
    })

    it('throws PlaylistAlreadyDeletedException when already taken down', async () => {
      prisma.playlist.findFirst.mockResolvedValue(
        buildPlaylistWithOwner({ deletedAt: new Date() }) as never,
      )

      await expect(service.softDelete('playlist-1', STAFF_ID)).rejects.toThrow(
        PlaylistAlreadyDeletedException,
      )
    })

    it('throws PlaylistAlreadyDeletedException when a concurrent request wins the race', async () => {
      prisma.playlist.findFirst.mockResolvedValue(buildPlaylistWithOwner() as never)
      transaction.playlist.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.softDelete('playlist-1', STAFF_ID)).rejects.toThrow(
        PlaylistAlreadyDeletedException,
      )
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    /** AC2: take-down stamps deletedAt only; visibility is not touched. */
    it('stamps deletedAt only, audits it, and leaves isPublic alone', async () => {
      prisma.playlist.findFirst.mockResolvedValue(buildPlaylistWithOwner() as never)
      transaction.playlist.updateMany.mockResolvedValue({ count: 1 })
      transaction.playlist.findFirstOrThrow.mockResolvedValue(
        buildPlaylistWithOwner({ deletedAt: new Date() }) as never,
      )

      const result = await service.softDelete('playlist-1', STAFF_ID, 'spam')

      expect(transaction.playlist.updateMany).toHaveBeenCalledWith({
        where: { id: 'playlist-1', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      })
      expect(transaction.playlistTrack.deleteMany).not.toHaveBeenCalled()
      expect(result.deletedAt).toBeInstanceOf(Date)
      expect(result.isPublic).toBe(true)
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'admin-playlists.delete',
            entityType: 'admin-playlists',
            entityId: 'playlist-1',
            metadata: expect.objectContaining({ reason: 'spam' }),
          }),
        }),
      )
    })
  })

  describe('restore', () => {
    it('throws PlaylistNotFoundException when the playlist does not exist', async () => {
      prisma.playlist.findFirst.mockResolvedValue(null)

      await expect(service.restore('missing', STAFF_ID)).rejects.toThrow(PlaylistNotFoundException)
    })

    it('throws PlaylistNotDeletedException when the playlist is not taken down', async () => {
      prisma.playlist.findFirst.mockResolvedValue(buildPlaylistWithOwner() as never)

      await expect(service.restore('playlist-1', STAFF_ID)).rejects.toThrow(
        PlaylistNotDeletedException,
      )
    })

    it('throws PlaylistNotDeletedException when a concurrent request wins the race', async () => {
      prisma.playlist.findFirst.mockResolvedValue(
        buildPlaylistWithOwner({ deletedAt: new Date() }) as never,
      )
      transaction.playlist.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.restore('playlist-1', STAFF_ID)).rejects.toThrow(
        PlaylistNotDeletedException,
      )
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    /** AC2: restore clears deletedAt and does not re-publish a hidden playlist. */
    it('clears deletedAt only and keeps a hidden playlist hidden', async () => {
      prisma.playlist.findFirst.mockResolvedValue(
        buildPlaylistWithOwner({ isPublic: false, deletedAt: new Date() }) as never,
      )
      transaction.playlist.updateMany.mockResolvedValue({ count: 1 })
      transaction.playlist.findFirstOrThrow.mockResolvedValue(
        buildPlaylistWithOwner({ isPublic: false }) as never,
      )

      const result = await service.restore('playlist-1', STAFF_ID)

      expect(transaction.playlist.updateMany).toHaveBeenCalledWith({
        where: { id: 'playlist-1', deletedAt: { not: null } },
        data: { deletedAt: null },
      })
      expect(result).toMatchObject({ deletedAt: null, isPublic: false })
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'admin-playlists.restore' }),
        }),
      )
    })
  })
})
