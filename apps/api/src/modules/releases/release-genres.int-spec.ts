import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
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
import { RELEASE_ERRORS } from './errors'

const version = draft.updatedAt.toISOString()
const advanced = { ...draft, updatedAt: new Date('2026-10-05T10:00:00Z') }
const house = { id: '0199aee0-0000-7000-8000-0000000000e1', slug: 'house', name: 'House' }
const techno = { id: '0199aee0-0000-7000-8000-0000000000e2', slug: 'techno', name: 'Techno' }
const url = `/api/v1/artists/me/releases/${draft.id}/tracks/${trackDraftId}`
let app: INestApplication

const patch = (body: object) =>
  request(app.getHttpServer())
    .patch(url)
    .set('x-test-artist', ownerId)
    .send({ ...body, expectedUpdatedAt: version })

describe('Recording genres (HTTP)', () => {
  beforeAll(async () => {
    app = await createReleasesTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  beforeEach(() => {
    resetReleaseMocks()
    transactionMock.release.updateManyAndReturn.mockResolvedValue([advanced])
    transactionMock.artistTrackDraft.findFirst.mockResolvedValue({ sourceTrackId: null } as never)
    transactionMock.artistTrackDraft.updateManyAndReturn.mockResolvedValue([
      { id: trackDraftId, title: 'Night drive', isrc: null },
    ] as never)
  })

  describe('catalogue', () => {
    it('lists every genre by name for the signed-in artist', async () => {
      prismaMock.genre.findMany.mockResolvedValue([house, techno] as never)
      const response = await request(app.getHttpServer())
        .get('/api/v1/artists/me/genres')
        .set('x-test-artist', ownerId)
        .expect(200)
      expect(response.headers['cache-control']).toBe('private, no-store')
      expect(response.body).toEqual([house, techno])
      expect(prismaMock.genre.findMany).toHaveBeenCalledWith({
        select: { id: true, slug: true, name: true },
        orderBy: { name: 'asc' },
      })
    })

    it('requires an artist session', async () => {
      await request(app.getHttpServer()).get('/api/v1/artists/me/genres').expect(401)
    })
  })

  describe('recording', () => {
    it('replaces the genres of a recording on the owned draft', async () => {
      transactionMock.genre.findMany.mockResolvedValue([house, techno] as never)
      const response = await patch({ genreIds: [techno.id, house.id] }).expect(200)
      expect(response.body.track).toEqual({
        id: trackDraftId,
        title: 'Night drive',
        isrc: null,
        genres: [house, techno],
      })
      expect(transactionMock.artistTrackDraftGenre.deleteMany).toHaveBeenCalledWith({
        where: { draftId: trackDraftId },
      })
      expect(transactionMock.artistTrackDraftGenre.createMany).toHaveBeenCalledWith({
        data: [
          { draftId: trackDraftId, genreId: house.id },
          { draftId: trackDraftId, genreId: techno.id },
        ],
      })
    })

    it.each([
      ['no genre', []],
      [
        'more than three genres',
        [1, 2, 3, 4].map((n) => `0199aee0-0000-7000-8000-00000000000${n}`),
      ],
      ['the same genre twice', [house.id, house.id]],
      ['a malformed ID', ['house']],
    ])('rejects %s', async (_case, genreIds) => {
      await patch({ genreIds }).expect(400)
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('rejects a genre that is not in the catalogue', async () => {
      transactionMock.genre.findMany.mockResolvedValue([house] as never)
      const response = await patch({ genreIds: [house.id, techno.id] }).expect(400)
      expect(response.body.message).toBe(RELEASE_ERRORS.GENRE_UNKNOWN)
      expect(transactionMock.artistTrackDraftGenre.createMany).not.toHaveBeenCalled()
    })

    it('keeps the catalogue genres of a reused compilation recording', async () => {
      transactionMock.artistTrackDraft.findFirst.mockResolvedValue({
        sourceTrackId: '0199aee0-0000-7000-8000-0000000000f1',
      } as never)
      await patch({ genreIds: [house.id] }).expect(409)
      expect(transactionMock.artistTrackDraftGenre.deleteMany).not.toHaveBeenCalled()
    })

    it('hides a recording that is not on this release', async () => {
      transactionMock.genre.findMany.mockResolvedValue([house] as never)
      transactionMock.artistTrackDraft.updateManyAndReturn.mockResolvedValue([])
      await patch({ genreIds: [house.id] }).expect(404)
      expect(transactionMock.artistTrackDraftGenre.createMany).not.toHaveBeenCalled()
    })

    it('renames a recording without touching its genres', async () => {
      transactionMock.artistTrackDraft.updateManyAndReturn.mockResolvedValue([
        { id: trackDraftId, title: 'Night drive (Extended)', isrc: null },
      ] as never)
      const response = await patch({ title: '  Night drive (Extended)  ' }).expect(200)
      expect(response.body.track).toEqual({
        id: trackDraftId,
        title: 'Night drive (Extended)',
        isrc: null,
      })
      expect(transactionMock.artistTrackDraft.updateManyAndReturn.mock.calls[0]?.[0]?.data).toEqual(
        { title: 'Night drive (Extended)' },
      )
      expect(transactionMock.artistTrackDraftGenre.deleteMany).not.toHaveBeenCalled()
    })
  })
})
