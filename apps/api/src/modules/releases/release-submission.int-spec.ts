import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import { prismaMock } from '@test/mocks'
import request from 'supertest'
import {
  createReleasesTestApp,
  creditId,
  draft,
  otherOwnerId,
  ownerId,
  resetReleaseMocks,
  trackDraftId,
  transactionMock,
} from './__tests__/releases-test-app'

const version = draft.updatedAt.toISOString()
const confirmedAt = new Date('2026-10-05T09:00:00Z')
/** A release that satisfies every submission rule; identifiers are deliberately absent. */
const readyRelease = {
  ...draft,
  masterOwnerType: 'ARTIST' as const,
  writersConfirmedAt: confirmedAt,
  accuracyConfirmedAt: confirmedAt,
  trackDrafts: [{ id: trackDraftId, isrc: null }],
  tracks: [],
  contributors: [{ id: creditId, roles: ['PERFORMER' as const] }],
  splits: [
    { rightType: 'RECORDING' as const, shareBasisPoints: 10_000 },
    { rightType: 'COMPOSITION' as const, shareBasisPoints: 10_000 },
  ],
}
const submitted = { ...draft, status: 'SUBMITTED' as const, submittedAt: confirmedAt }
let app: INestApplication

const submit = (body: object, artist = ownerId) =>
  request(app.getHttpServer())
    .post(`/api/v1/releases/${draft.id}/submit`)
    .set('x-test-artist', artist)
    .send(body)

describe('Release submission (HTTP)', () => {
  beforeAll(async () => {
    app = await createReleasesTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  beforeEach(() => {
    resetReleaseMocks()
  })

  describe('submit', () => {
    it('submits a ready draft for Bitrate review even without identifiers', async () => {
      transactionMock.release.findFirst.mockResolvedValue(readyRelease as never)
      transactionMock.release.updateManyAndReturn.mockResolvedValue([submitted])
      const response = await submit({ reviewed: true, expectedUpdatedAt: version }).expect(200)
      expect(response.headers['cache-control']).toBe('private, no-store')
      expect(response.body).toMatchObject({ id: draft.id, status: 'SUBMITTED' })
      expect(transactionMock.release.updateManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: draft.id,
            ownerArtistId: ownerId,
            deletedAt: null,
            status: 'DRAFT',
            updatedAt: draft.updatedAt,
          },
          data: { status: 'SUBMITTED', submittedAt: expect.any(Date), updatedAt: expect.any(Date) },
        }),
      )
    })

    it('lists the blockers and leaves the draft unchanged', async () => {
      transactionMock.release.findFirst.mockResolvedValue({
        ...readyRelease,
        accuracyConfirmedAt: null,
        splits: [],
      } as never)
      const response = await submit({ reviewed: true, expectedUpdatedAt: version }).expect(422)
      expect(response.body.blockers).toEqual([
        { code: 'ACCURACY_NOT_CONFIRMED' },
        { code: 'SPLITS_INCOMPLETE', rightType: 'RECORDING', totalBasisPoints: 0 },
        { code: 'SPLITS_INCOMPLETE', rightType: 'COMPOSITION', totalBasisPoints: 0 },
      ])
      expect(transactionMock.release.updateManyAndReturn).not.toHaveBeenCalled()
    })

    it.each([
      ['without the review confirmation', { expectedUpdatedAt: version }],
      ['with an unchecked review confirmation', { reviewed: false, expectedUpdatedAt: version }],
    ])('rejects a submission %s', async (_case, body) => {
      await submit(body).expect(400)
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it.each([
      ['a stale version', { ...readyRelease, updatedAt: new Date('2026-10-05T11:00:00Z') }],
      ['a release that is not a draft', { ...readyRelease, status: 'SUBMITTED' as const }],
    ])('rejects %s', async (_case, record) => {
      transactionMock.release.findFirst.mockResolvedValue(record as never)
      await submit({ reviewed: true, expectedUpdatedAt: version }).expect(409)
      expect(transactionMock.release.updateManyAndReturn).not.toHaveBeenCalled()
    })

    it('rejects a draft changed between the readiness check and the write', async () => {
      transactionMock.release.findFirst.mockResolvedValue(readyRelease as never)
      transactionMock.release.updateManyAndReturn.mockResolvedValue([])
      await submit({ reviewed: true, expectedUpdatedAt: version }).expect(409)
    })

    it('hides a release owned by another artist', async () => {
      transactionMock.release.findFirst.mockResolvedValue(null)
      await submit({ reviewed: true, expectedUpdatedAt: version }, otherOwnerId).expect(404)
      expect(transactionMock.release.findFirst.mock.calls[0]?.[0]?.where).toEqual({
        id: draft.id,
        ownerArtistId: otherOwnerId,
        deletedAt: null,
      })
    })
  })

  describe('withdraw', () => {
    const withdraw = (artist = ownerId) =>
      request(app.getHttpServer())
        .post(`/api/v1/releases/${draft.id}/withdraw`)
        .set('x-test-artist', artist)
        .send({ expectedUpdatedAt: version })

    it('returns a submitted release to its draft', async () => {
      prismaMock.release.updateManyAndReturn.mockResolvedValue([draft])
      const response = await withdraw().expect(200)
      expect(response.body).toMatchObject({ id: draft.id, status: 'DRAFT' })
      expect(prismaMock.release.updateManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: draft.id,
            ownerArtistId: ownerId,
            deletedAt: null,
            status: 'SUBMITTED',
            updatedAt: draft.updatedAt,
          },
          data: { status: 'DRAFT', submittedAt: null, updatedAt: expect.any(Date) },
        }),
      )
    })

    it('rejects a release that is not submitted or changed', async () => {
      prismaMock.release.updateManyAndReturn.mockResolvedValue([])
      prismaMock.release.findFirst.mockResolvedValue(draft)
      await withdraw().expect(409)
    })

    it('hides a release owned by another artist', async () => {
      prismaMock.release.updateManyAndReturn.mockResolvedValue([])
      prismaMock.release.findFirst.mockResolvedValue(null)
      await withdraw(otherOwnerId).expect(404)
    })
  })

  // Two writes in one millisecond, or a node with a slower clock, must still change the version.
  describe('version', () => {
    const nextVersion = new Date(draft.updatedAt.getTime() + 1)

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(draft.updatedAt.getTime())
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('advances on submit while the clock has not moved', async () => {
      transactionMock.release.findFirst.mockResolvedValue(readyRelease as never)
      transactionMock.release.updateManyAndReturn.mockResolvedValue([submitted])
      await submit({ reviewed: true, expectedUpdatedAt: version }).expect(200)
      expect(transactionMock.release.updateManyAndReturn.mock.calls[0]?.[0]?.data).toMatchObject({
        updatedAt: nextVersion,
      })
    })

    it.each([
      ['withdraw', 'post', `/api/v1/releases/${draft.id}/withdraw`, {}],
      ['a draft edit', 'patch', `/api/v1/releases/${draft.id}`, { title: 'Renamed' }],
    ] as const)(
      'advances on %s while the clock has not moved',
      async (_action, method, url, body) => {
        prismaMock.release.updateManyAndReturn.mockResolvedValue([draft])
        await request(app.getHttpServer())
          [method](url)
          .set('x-test-artist', ownerId)
          .send({ ...body, expectedUpdatedAt: version })
          .expect(200)
        expect(prismaMock.release.updateManyAndReturn.mock.calls[0]?.[0]?.data).toMatchObject({
          updatedAt: nextVersion,
        })
      },
    )
  })

  it.each(['submit', 'withdraw'])('requires an artist session to %s', async (action) => {
    await request(app.getHttpServer())
      .post(`/api/v1/releases/${draft.id}/${action}`)
      .send({})
      .expect(401)
  })

  describe('workspace', () => {
    it('shows rights, splits, identifiers and readiness', async () => {
      const record = {
        ...readyRelease,
        cover: null,
        owner: { username: 'Test artist' },
        trackDrafts: [
          {
            id: trackDraftId,
            title: 'Night Signal',
            version: 'ORIGINAL',
            status: 'READY',
            duration: 236,
            isDemo: false,
            isrc: null,
          },
        ],
        tracks: [],
        contributors: [{ id: creditId, displayName: 'Taylor Reid', roles: ['PERFORMER'] }],
        splits: [
          { contributorId: creditId, rightType: 'RECORDING', shareBasisPoints: 10_000 },
          { contributorId: creditId, rightType: 'COMPOSITION', shareBasisPoints: 10_000 },
        ],
        _count: { trackDrafts: 1, tracks: 0, contributors: 1 },
      }
      transactionMock.release.findFirst
        .mockResolvedValueOnce(record as never)
        .mockResolvedValueOnce(readyRelease as never)
      const response = await request(app.getHttpServer())
        .get(`/api/v1/releases/${draft.id}/workspace`)
        .set('x-test-artist', ownerId)
        .expect(200)
      expect(response.body).toMatchObject({
        upc: null,
        submittedAt: null,
        rights: {
          masterOwnerType: 'ARTIST',
          masterOwnerName: null,
          writersConfirmedAt: confirmedAt.toISOString(),
          accuracyConfirmedAt: confirmedAt.toISOString(),
        },
        splits: record.splits,
        trackDrafts: [expect.objectContaining({ id: trackDraftId, isrc: null })],
        readiness: {
          blockers: [],
          notices: [{ code: 'UPC_MISSING' }, { code: 'ISRC_MISSING', trackId: trackDraftId }],
        },
      })
      expect(transactionMock.release.findFirst.mock.calls[1]?.[0]?.where).toEqual({
        id: draft.id,
        ownerArtistId: ownerId,
        deletedAt: null,
      })
      // Both reads see one snapshot, so readiness always matches the returned data.
      expect(prismaMock.$transaction.mock.calls[0]?.[1]).toEqual({
        isolationLevel: 'RepeatableRead',
      })
    })

    it('hides a release deleted between the preview and the readiness check', async () => {
      transactionMock.release.findFirst
        .mockResolvedValueOnce({ ...readyRelease, owner: { username: 'Test artist' } } as never)
        .mockResolvedValueOnce(null)
      await request(app.getHttpServer())
        .get(`/api/v1/releases/${draft.id}/workspace`)
        .set('x-test-artist', ownerId)
        .expect(404)
    })
  })
})
