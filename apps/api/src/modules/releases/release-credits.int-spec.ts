import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import type { ReleaseCreditRole } from '@prisma/client'
import { prismaMock } from '@test/mocks'
import request from 'supertest'
import {
  createReleasesTestApp,
  creditId,
  draft,
  ownerId,
  resetReleaseMocks,
  transactionMock,
} from './__tests__/releases-test-app'

const version = draft.updatedAt.toISOString()
const advanced = { ...draft, updatedAt: new Date('2026-10-05T10:00:00Z') }
const soloRoles: ReleaseCreditRole[] = ['PERFORMER', 'COMPOSER', 'LYRICIST']
const soloCredit = {
  id: creditId,
  releaseId: draft.id,
  artistId: ownerId,
  displayName: 'artist',
  roles: soloRoles,
}
const fullShares = (contributorId: string) =>
  (['RECORDING'] as const).map((rightType) => ({
    releaseId: draft.id,
    contributorId,
    rightType,
    shareBasisPoints: 10_000,
  }))

let app: INestApplication

describe('Release credits (HTTP)', () => {
  beforeAll(async () => {
    app = await createReleasesTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  beforeEach(() => {
    resetReleaseMocks()
    transactionMock.release.updateManyAndReturn.mockResolvedValue([advanced])
  })

  describe('a new draft', () => {
    it('credits its artist alone with every writing role and 100% of both rights', async () => {
      transactionMock.release.create.mockResolvedValue(draft)
      transactionMock.releaseContributor.create.mockResolvedValue(soloCredit)
      const response = await request(app.getHttpServer())
        .post('/api/v1/releases')
        .set('x-test-artist', ownerId)
        .send({ title: draft.title })
        .expect(201)
      expect(response.body).toMatchObject({ id: draft.id, status: 'DRAFT' })
      expect(transactionMock.releaseContributor.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { releaseId: draft.id, artistId: ownerId, displayName: 'artist', roles: soloRoles },
        }),
      )
      expect(transactionMock.releaseSplit.createMany).toHaveBeenCalledWith({
        data: fullShares(creditId),
      })
    })
  })

  describe('POST /releases/:id/contributors/self', () => {
    const url = `/api/v1/releases/${draft.id}/contributors/self`

    it('credits the artist alone on a draft without credits', async () => {
      transactionMock.releaseContributor.count.mockResolvedValue(0)
      transactionMock.releaseContributor.create.mockResolvedValue(soloCredit)
      const response = await request(app.getHttpServer())
        .post(url)
        .set('x-test-artist', ownerId)
        .send({ expectedUpdatedAt: version })
        .expect(201)
      expect(response.headers['cache-control']).toBe('private, no-store')
      expect(response.body).toEqual({
        release: expect.objectContaining({ id: draft.id }),
        participant: { id: creditId, displayName: 'artist', roles: soloRoles },
      })
      expect(transactionMock.releaseSplit.createMany).toHaveBeenCalledWith({
        data: fullShares(creditId),
      })
      expect(transactionMock.release.updateManyAndReturn.mock.calls[0]?.[0]?.data).toMatchObject({
        writersConfirmedAt: null,
        accuracyConfirmedAt: null,
      })
    })

    it('refuses a draft that already credits someone, changing nothing', async () => {
      transactionMock.releaseContributor.count.mockResolvedValue(1)
      await request(app.getHttpServer())
        .post(url)
        .set('x-test-artist', ownerId)
        .send({ expectedUpdatedAt: version })
        .expect(409)
      expect(transactionMock.releaseContributor.create).not.toHaveBeenCalled()
      expect(transactionMock.releaseSplit.createMany).not.toHaveBeenCalled()
    })

    it('requires an artist session and the release version', async () => {
      await request(app.getHttpServer()).post(url).send({ expectedUpdatedAt: version }).expect(401)
      await request(app.getHttpServer())
        .post(url)
        .set('x-test-artist', ownerId)
        .send({})
        .expect(400)
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /releases/:id/contributors/:contributorId', () => {
    const url = `/api/v1/releases/${draft.id}/contributors/${creditId}`

    it('removes the credit and clears both rights confirmations', async () => {
      transactionMock.releaseContributor.deleteMany.mockResolvedValue({ count: 1 })
      const response = await request(app.getHttpServer())
        .delete(url)
        .set('x-test-artist', ownerId)
        .send({ expectedUpdatedAt: version })
        .expect(200)
      expect(response.headers['cache-control']).toBe('private, no-store')
      expect(response.body).toEqual({
        release: expect.objectContaining({ id: draft.id }),
        contributorId: creditId,
      })
      expect(transactionMock.releaseContributor.deleteMany).toHaveBeenCalledWith({
        where: { id: creditId, releaseId: draft.id },
      })
      expect(transactionMock.release.updateManyAndReturn.mock.calls[0]?.[0]?.data).toMatchObject({
        writersConfirmedAt: null,
        accuracyConfirmedAt: null,
      })
    })

    it('answers 404 for a credit that is not on the release', async () => {
      transactionMock.releaseContributor.deleteMany.mockResolvedValue({ count: 0 })
      await request(app.getHttpServer())
        .delete(url)
        .set('x-test-artist', ownerId)
        .send({ expectedUpdatedAt: version })
        .expect(404)
    })

    it('answers 409 once the release is no longer an unchanged draft', async () => {
      transactionMock.release.updateManyAndReturn.mockResolvedValue([])
      transactionMock.release.findFirst.mockResolvedValue(draft)
      await request(app.getHttpServer())
        .delete(url)
        .set('x-test-artist', ownerId)
        .send({ expectedUpdatedAt: version })
        .expect(409)
      expect(transactionMock.releaseContributor.deleteMany).not.toHaveBeenCalled()
    })

    it('requires an artist session, the release version and a UUID', async () => {
      await request(app.getHttpServer())
        .delete(url)
        .send({ expectedUpdatedAt: version })
        .expect(401)
      await request(app.getHttpServer())
        .delete(url)
        .set('x-test-artist', ownerId)
        .send({})
        .expect(400)
      await request(app.getHttpServer())
        .delete(`/api/v1/releases/${draft.id}/contributors/not-a-uuid`)
        .set('x-test-artist', ownerId)
        .send({ expectedUpdatedAt: version })
        .expect(400)
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })
  })
})
