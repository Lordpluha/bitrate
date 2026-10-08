import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
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
  transactionMock,
} from './__tests__/releases-test-app'

const version = draft.updatedAt.toISOString()
const advanced = { ...draft, updatedAt: new Date('2026-10-05T10:00:00Z') }
const lockData = () => transactionMock.release.updateManyAndReturn.mock.calls[0]?.[0]?.data

describe('Release rights confirmation (HTTP)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createReleasesTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  beforeEach(() => {
    resetReleaseMocks()
  })

  it.each([
    ['adding', 'post', `/api/v1/releases/${draft.id}/contributors`],
    ['editing', 'patch', `/api/v1/releases/${draft.id}/contributors/${creditId}`],
  ] as const)('clears both confirmations when %s a credit', async (_action, method, url) => {
    const credit = { id: creditId, releaseId: draft.id, artistId: null, displayName: 'Taylor Reid' }
    transactionMock.release.updateManyAndReturn.mockResolvedValue([advanced])
    transactionMock.releaseContributor.create.mockResolvedValue({ ...credit, roles: ['PERFORMER'] })
    transactionMock.releaseContributor.updateManyAndReturn.mockResolvedValue([
      { ...credit, roles: ['PERFORMER'] },
    ])
    await request(app.getHttpServer())
      [method](url)
      .set('x-test-artist', ownerId)
      .send({ displayName: 'Taylor Reid', roles: ['PERFORMER'], expectedUpdatedAt: version })
      .expect(method === 'post' ? 201 : 200)
    expect(lockData()).toMatchObject({ writersConfirmedAt: null, accuracyConfirmedAt: null })
  })

  it('records the artist as master owner and both confirmations', async () => {
    transactionMock.release.updateManyAndReturn.mockResolvedValue([advanced])
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}/rights`)
      .set('x-test-artist', ownerId)
      .send({
        masterOwner: { type: 'ARTIST' },
        writersConfirmed: true,
        accuracyConfirmed: true,
        expectedUpdatedAt: version,
      })
      .expect(200)
    expect(response.headers['cache-control']).toBe('private, no-store')
    expect(response.body).toMatchObject({
      id: draft.id,
      updatedAt: advanced.updatedAt.toISOString(),
    })
    expect(transactionMock.release.updateManyAndReturn.mock.calls[0]?.[0]?.where).toEqual({
      id: draft.id,
      ownerArtistId: ownerId,
      deletedAt: null,
      status: 'DRAFT',
      updatedAt: draft.updatedAt,
    })
    expect(lockData()).toMatchObject({
      masterOwnerType: 'ARTIST',
      masterOwnerName: null,
      writersConfirmedAt: expect.any(Date),
      accuracyConfirmedAt: expect.any(Date),
    })
  })

  it('records another master owner by name and clears withdrawn confirmations', async () => {
    transactionMock.release.updateManyAndReturn.mockResolvedValue([advanced])
    await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}/rights`)
      .set('x-test-artist', ownerId)
      .send({
        masterOwner: { type: 'OTHER', name: ' North Label ' },
        writersConfirmed: false,
        accuracyConfirmed: false,
        expectedUpdatedAt: version,
      })
      .expect(200)
    expect(lockData()).toMatchObject({
      masterOwnerType: 'OTHER',
      masterOwnerName: 'North Label',
      writersConfirmedAt: null,
      accuracyConfirmedAt: null,
    })
  })

  it.each([
    ['another owner without a name', { type: 'OTHER' }],
    ['the artist with a name', { type: 'ARTIST', name: 'North Label' }],
    ['an unknown owner type', { type: 'LABEL', name: 'North Label' }],
  ])('rejects %s', async (_case, masterOwner) => {
    await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}/rights`)
      .set('x-test-artist', ownerId)
      .send({
        masterOwner,
        writersConfirmed: true,
        accuracyConfirmed: true,
        expectedUpdatedAt: version,
      })
      .expect(400)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('hides a release owned by another artist', async () => {
    transactionMock.release.updateManyAndReturn.mockResolvedValue([])
    transactionMock.release.findFirst.mockResolvedValue(null)
    await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}/rights`)
      .set('x-test-artist', otherOwnerId)
      .send({
        masterOwner: null,
        writersConfirmed: false,
        accuracyConfirmed: false,
        expectedUpdatedAt: version,
      })
      .expect(404)
  })

  it('rejects a stale version or a release that is no longer a draft', async () => {
    transactionMock.release.updateManyAndReturn.mockResolvedValue([])
    transactionMock.release.findFirst.mockResolvedValue(draft)
    await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}/rights`)
      .set('x-test-artist', ownerId)
      .send({
        masterOwner: null,
        writersConfirmed: false,
        accuracyConfirmed: false,
        expectedUpdatedAt: version,
      })
      .expect(409)
  })

  it('requires an artist session', async () => {
    await request(app.getHttpServer()).patch(`/api/v1/releases/${draft.id}/rights`).expect(401)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })
})
