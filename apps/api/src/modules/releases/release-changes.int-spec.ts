import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { prismaMock } from '@test/mocks'
import { type DeepMockProxy, mockReset } from 'jest-mock-extended'
import request from 'supertest'
import {
  createReleasesTestApp,
  draft,
  otherOwnerId,
  ownerId,
  resetReleaseMocks,
  trackDraftId,
  transactionMock,
} from './__tests__/releases-test-app'
import { RELEASE_ERRORS } from './errors'

const requestId = '0199aee0-0000-7000-8000-0000000000a1'
const changeId = '0199aee0-0000-7000-8000-0000000000b1'
const base = `/api/v1/artists/me/releases/${draft.id}/changes`
const oldCover = '/static/releases/covers/0192f1c4-7d2b-7c11-9f3e-1a2b3c4d5e6f.jpg'
/** The smallest PNG header the image validator recognises. */
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49])

const live = {
  id: draft.id,
  ownerArtistId: ownerId,
  title: 'First release',
  cover: oldCover,
  status: 'RELEASED',
  unpublishedBy: null,
  isDemo: false,
  albumId: '0199aee0-0000-7000-8000-0000000000f9',
  updatedAt: draft.updatedAt,
}

const recording = {
  id: trackDraftId,
  title: 'Night drive',
  sourceTrackId: null,
  publishedAs: { track: { deletedAt: null, moderationBlockedAt: null } },
}

const created = (changes: object[]) => ({
  id: requestId,
  releaseId: draft.id,
  message: null,
  closedAt: null,
  createdAt: new Date('2026-11-12T10:00:00Z'),
  changes,
})

let app: INestApplication
let storage: DeepMockProxy<StorageService>

const submit = (owner = ownerId) =>
  request(app.getHttpServer()).post(base).set('x-test-artist', owner)

describe('Release change requests (HTTP)', () => {
  beforeAll(async () => {
    app = await createReleasesTestApp()
    storage = app.get(STORAGE_SERVICE)
  })

  afterAll(async () => {
    await app?.close()
  })

  beforeEach(() => {
    resetReleaseMocks()
    mockReset(storage)
    storage.getPresignedUrl.mockResolvedValue('/api/v1/storage/signed-cover')
    transactionMock.$queryRaw.mockResolvedValue([live] as never)
    transactionMock.artistTrackDraft.findMany.mockResolvedValue([recording] as never)
    transactionMock.releaseChangeRequest.create.mockImplementation((async (args: {
      data: { changes: { create: object[] } }
    }) =>
      created(
        args.data.changes.create.map((change) => ({
          id: changeId,
          requestId,
          status: 'PENDING',
          reason: null,
          decidedAt: null,
          draftId: null,
          createdAt: new Date('2026-11-12T10:00:00Z'),
          ...change,
        })),
      )) as never)
  })

  describe('submitting', () => {
    it('keeps the live release unchanged and queues each proposed value for review', async () => {
      const response = await submit()
        .field('title', '  Second light  ')
        .field('recordings', JSON.stringify([{ id: trackDraftId, title: 'Night drive (Edit)' }]))
        .attach('cover', png, { filename: 'cover.png', contentType: 'image/png' })
        .expect(201)

      const [{ data }] = transactionMock.releaseChangeRequest.create.mock.calls[0] as [
        { data: { releaseId: string; changes: { create: Record<string, unknown>[] } } },
      ]
      expect(data.releaseId).toBe(draft.id)
      const [title, cover, renamed] = data.changes.create
      expect(title).toEqual(
        expect.objectContaining({
          field: 'RELEASE_TITLE',
          pendingTarget: 'RELEASE_TITLE',
          previousValue: 'First release',
          proposedValue: 'Second light',
        }),
      )
      expect(cover).toEqual(
        expect.objectContaining({
          field: 'RELEASE_COVER',
          pendingTarget: 'RELEASE_COVER',
          previousValue: oldCover,
          proposedValue: expect.stringMatching(/^releases\/pending-covers\/[\w-]+\.png$/),
        }),
      )
      expect(renamed).toEqual(
        expect.objectContaining({
          field: 'RECORDING_TITLE',
          draftId: trackDraftId,
          pendingTarget: `RECORDING_TITLE:${trackDraftId}`,
          previousValue: 'Night drive',
          proposedValue: 'Night drive (Edit)',
        }),
      )
      // The proposed cover is stored outside the public image folders.
      expect(storage.upload).toHaveBeenCalledWith(
        String(cover?.proposedValue),
        expect.any(Buffer),
        'image/png',
      )
      expect(transactionMock.release.update).not.toHaveBeenCalled()
      expect(transactionMock.album.update).not.toHaveBeenCalled()
      expect(transactionMock.track.updateMany).not.toHaveBeenCalled()
      expect(response.body.changes).toHaveLength(3)
      // A pending cover is only reachable through a short-lived signed link.
      expect(response.body.changes[1].proposedValue).toBe('/api/v1/storage/signed-cover')
    })

    it('accepts a release the artist took offline', async () => {
      transactionMock.$queryRaw.mockResolvedValue([
        { ...live, status: 'UNPUBLISHED', unpublishedBy: 'ARTIST' },
      ] as never)
      await submit().field('title', 'Second light').expect(201)
    })

    it.each([
      ['a draft', { status: 'DRAFT' }],
      ['an approved release', { status: 'READY' }],
      ['a scheduled premiere', { status: 'SCHEDULED' }],
      ['a release being published', { status: 'PUBLISHING' }],
      ['a release in review', { status: 'SUBMITTED' }],
      ['a release Bitrate took down', { status: 'UNPUBLISHED', unpublishedBy: 'ADMIN' }],
      ['a demo release', { isDemo: true }],
    ])('refuses changes to %s and discards the uploaded cover', async (_case, state) => {
      transactionMock.$queryRaw.mockResolvedValue([{ ...live, ...state }] as never)
      const response = await submit()
        .attach('cover', png, { filename: 'cover.png', contentType: 'image/png' })
        .expect(409)
      expect(response.body.message).toBe(RELEASE_ERRORS.CHANGES_NOT_ALLOWED)
      expect(storage.deleteObject).toHaveBeenCalledWith(String(storage.upload.mock.calls[0]?.[0]))
      expect(transactionMock.releaseChangeRequest.create).not.toHaveBeenCalled()
    })

    it('hides a release of another artist', async () => {
      transactionMock.$queryRaw.mockResolvedValue([] as never)
      await submit(otherOwnerId).field('title', 'Second light').expect(404)
    })

    it('refuses a title equal to the current one', async () => {
      const response = await submit().field('title', 'First release').expect(409)
      expect(response.body.message).toBe(RELEASE_ERRORS.CHANGE_UNCHANGED)
    })

    it.each([
      ['a compilation reuse', { sourceTrackId: '0199aee0-0000-7000-8000-0000000000f1' }],
      ['an unpublished recording', { publishedAs: null }],
      [
        'a recording Bitrate removed',
        { publishedAs: { track: { deletedAt: null, moderationBlockedAt: new Date() } } },
      ],
    ])('refuses to rename %s', async (_case, state) => {
      transactionMock.artistTrackDraft.findMany.mockResolvedValue([
        { ...recording, ...state },
      ] as never)
      const response = await submit()
        .field('recordings', JSON.stringify([{ id: trackDraftId, title: 'Other' }]))
        .expect(409)
      expect(response.body.message).toBe(RELEASE_ERRORS.RECORDING_LOCKED)
    })

    it('hides a recording that is not on this release', async () => {
      transactionMock.artistTrackDraft.findMany.mockResolvedValue([])
      await submit()
        .field('recordings', JSON.stringify([{ id: trackDraftId, title: 'Other' }]))
        .expect(404)
    })

    it.each([
      ['nothing to change', {}],
      ['malformed recordings', { recordings: 'not json' }],
      [
        'the same recording twice',
        {
          recordings: JSON.stringify([
            { id: trackDraftId, title: 'A' },
            { id: trackDraftId, title: 'B' },
          ]),
        },
      ],
      ['an empty title', { title: '   ' }],
    ])('rejects %s', async (_case, fields: Record<string, string>) => {
      let call = submit()
      for (const [name, value] of Object.entries(fields)) call = call.field(name, value)
      await call.expect(400)
      expect(transactionMock.releaseChangeRequest.create).not.toHaveBeenCalled()
    })

    it('rejects a cover whose content is not the declared image', async () => {
      await submit()
        .attach('cover', Buffer.from('not an image'), {
          filename: 'cover.png',
          contentType: 'image/png',
        })
        .expect(400)
      expect(storage.upload).not.toHaveBeenCalled()
    })

    it('allows only one pending change per title, cover or recording', async () => {
      transactionMock.releaseChangeRequest.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      )
      const response = await submit().field('title', 'Second light').expect(409)
      expect(response.body.message).toBe(RELEASE_ERRORS.CHANGE_ALREADY_PENDING)
    })

    it('requires an artist session', async () => {
      await request(app.getHttpServer()).post(base).field('title', 'X').expect(401)
    })
  })

  describe('listing', () => {
    const change = (overrides: object) => ({
      id: changeId,
      requestId,
      field: 'RELEASE_TITLE',
      draftId: null,
      previousValue: 'First release',
      proposedValue: 'Second light',
      status: 'PENDING',
      reason: null,
      decidedAt: null,
      createdAt: new Date('2026-11-12T10:00:00Z'),
      request: { message: null },
      ...overrides,
    })

    it('shows pending changes and the latest decision for each target', async () => {
      prismaMock.release.findFirst.mockResolvedValue({ id: draft.id } as never)
      prismaMock.releaseChange.findMany.mockResolvedValue([
        change({ id: 'c3', proposedValue: 'Third light' }),
        change({ id: 'c2', status: 'REJECTED', reason: 'Too **long**' }),
        change({ id: 'c1', status: 'APPROVED' }),
        change({ id: 'c0', status: 'WITHDRAWN', field: 'RELEASE_COVER' }),
      ] as never)
      const response = await request(app.getHttpServer())
        .get(base)
        .set('x-test-artist', ownerId)
        .expect(200)
      expect(response.headers['cache-control']).toBe('private, no-store')
      expect(response.body.data.map((item: { id: string }) => item.id)).toEqual(['c3', 'c2'])
      expect(response.body.data[1]).toEqual(
        expect.objectContaining({ status: 'REJECTED', reason: 'Too **long**' }),
      )
    })

    it('hides another artist’s release', async () => {
      prismaMock.release.findFirst.mockResolvedValue(null)
      await request(app.getHttpServer()).get(base).set('x-test-artist', otherOwnerId).expect(404)
    })
  })

  describe('withdrawing', () => {
    const withdraw = () =>
      request(app.getHttpServer())
        .post(`${base}/${requestId}/withdraw`)
        .set('x-test-artist', ownerId)

    beforeEach(() => {
      transactionMock.releaseChangeRequest.findFirst.mockResolvedValue({ id: requestId } as never)
      transactionMock.releaseChangeRequest.update.mockResolvedValue(created([]) as never)
    })

    it('withdraws the pending changes and discards a proposed cover', async () => {
      transactionMock.releaseChange.updateManyAndReturn.mockResolvedValue([
        { field: 'RELEASE_TITLE', proposedValue: 'Second light' },
        { field: 'RELEASE_COVER', proposedValue: 'releases/pending-covers/new.png' },
      ] as never)
      await withdraw().expect(200)
      expect(transactionMock.releaseChange.updateManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { requestId, status: 'PENDING' },
          data: expect.objectContaining({ status: 'WITHDRAWN', pendingTarget: null }),
        }),
      )
      expect(transactionMock.releaseChangeRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { closedAt: expect.any(Date) } }),
      )
      expect(storage.deleteObject).toHaveBeenCalledWith('releases/pending-covers/new.png')
    })

    it('refuses a request with nothing left to withdraw', async () => {
      transactionMock.releaseChange.updateManyAndReturn.mockResolvedValue([])
      const response = await withdraw().expect(409)
      expect(response.body.message).toBe(RELEASE_ERRORS.CHANGE_NOT_PENDING)
    })

    it('hides a request of another release', async () => {
      transactionMock.releaseChangeRequest.findFirst.mockResolvedValue(null)
      await withdraw().expect(404)
    })
  })
})
