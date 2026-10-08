import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { prismaMock } from '@test/mocks'
import request from 'supertest'
import {
  createReleasesTestApp,
  draft,
  ownerId,
  resetReleaseMocks,
  trackDraftId,
  transactionMock,
} from './__tests__/releases-test-app'

const version = draft.updatedAt.toISOString()
const advanced = { ...draft, updatedAt: new Date('2026-10-05T10:00:00Z') }
const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
  })
let app: INestApplication

describe('Release identifiers (HTTP)', () => {
  beforeAll(async () => {
    app = await createReleasesTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  beforeEach(() => {
    resetReleaseMocks()
  })

  describe('UPC', () => {
    const patch = (body: object) =>
      request(app.getHttpServer())
        .patch(`/api/v1/releases/${draft.id}`)
        .set('x-test-artist', ownerId)
        .send({ ...body, expectedUpdatedAt: version })

    it.each([
      ['saves', '036000291452'],
      ['clears', null],
    ])('%s the release barcode', async (_action, upc) => {
      prismaMock.release.updateManyAndReturn.mockResolvedValue([{ ...advanced, upc }])
      const response = await patch({ upc }).expect(200)
      expect(response.body.upc).toBe(upc)
      expect(prismaMock.release.updateManyAndReturn.mock.calls[0]?.[0]?.data).toEqual({ upc })
    })

    it('rejects a barcode with a wrong check digit', async () => {
      await patch({ upc: '036000291453' }).expect(400)
      expect(prismaMock.release.updateManyAndReturn).not.toHaveBeenCalled()
    })

    it('reports a barcode already used by another release', async () => {
      prismaMock.release.updateManyAndReturn.mockRejectedValue(uniqueViolation())
      const response = await patch({ upc: '036000291452' }).expect(409)
      expect(response.body.message).toBe('This UPC is already used by another release')
    })
  })

  describe('ISRC', () => {
    const url = `/api/v1/releases/${draft.id}/tracks/${trackDraftId}`
    const patch = (body: object) =>
      request(app.getHttpServer())
        .patch(url)
        .set('x-test-artist', ownerId)
        .send({ ...body, expectedUpdatedAt: version })

    beforeEach(() => {
      transactionMock.release.updateManyAndReturn.mockResolvedValue([advanced])
    })

    it('stores the compact code on a recording of the owned draft', async () => {
      transactionMock.artistTrackDraft.updateManyAndReturn.mockResolvedValue([
        { id: trackDraftId, isrc: 'USRC17607839' },
      ] as never)
      const response = await patch({ isrc: 'US-RC1-76-07839' }).expect(200)
      expect(response.headers['cache-control']).toBe('private, no-store')
      expect(response.body).toEqual({
        release: expect.objectContaining({ id: draft.id }),
        track: { id: trackDraftId, isrc: 'USRC17607839' },
      })
      expect(transactionMock.artistTrackDraft.updateManyAndReturn).toHaveBeenCalledWith({
        where: { id: trackDraftId, releaseId: draft.id, ownerArtistId: ownerId, deletedAt: null },
        data: { isrc: 'USRC17607839' },
        select: { id: true, isrc: true },
      })
    })

    it('clears the code', async () => {
      transactionMock.artistTrackDraft.updateManyAndReturn.mockResolvedValue([
        { id: trackDraftId, isrc: null },
      ] as never)
      await patch({ isrc: null }).expect(200)
      expect(transactionMock.artistTrackDraft.updateManyAndReturn.mock.calls[0]?.[0]?.data).toEqual(
        { isrc: null },
      )
    })

    it('rejects an invalid code', async () => {
      await patch({ isrc: 'US-RC1-76-0783' }).expect(400)
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('hides a recording that is not on this release', async () => {
      transactionMock.artistTrackDraft.updateManyAndReturn.mockResolvedValue([])
      await patch({ isrc: 'USRC17607839' }).expect(404)
    })

    it('reports a code already used by another recording', async () => {
      transactionMock.artistTrackDraft.updateManyAndReturn.mockRejectedValue(uniqueViolation())
      const response = await patch({ isrc: 'USRC17607839' }).expect(409)
      expect(response.body.message).toBe('This ISRC is already used by another recording')
    })

    it('rejects a stale release version', async () => {
      transactionMock.release.updateManyAndReturn.mockResolvedValue([])
      transactionMock.release.findFirst.mockResolvedValue(draft)
      await patch({ isrc: 'USRC17607839' }).expect(409)
      expect(transactionMock.artistTrackDraft.updateManyAndReturn).not.toHaveBeenCalled()
    })

    it('requires an artist session', async () => {
      await request(app.getHttpServer()).patch(url).send({}).expect(401)
    })
  })
})
