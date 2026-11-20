import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { PlaybackEventsController } from './playback-events.controller'
import { PlaybackEventsService } from './playback-events.service'
import { TasteController } from './taste.controller'
import { TasteService } from './taste.service'

const USER = { id: '0199aee0-0000-7000-8000-000000000001' }
const ID = '0199aee0-0000-7000-8000-000000000009'

const validEvent = {
  clientPlayId: '0199aee0-0000-7000-8000-000000000003',
  trackId: '0199aee0-0000-7000-8000-000000000002',
  startedAt: '2026-11-19T11:55:00.000Z',
  endedAt: '2026-11-19T11:58:00.000Z',
  listenedMs: 180_000,
  endReason: 'SKIPPED',
  source: 'RADIO',
} as const

describe('Recommendation signals (HTTP)', () => {
  let app: INestApplication
  const events = { record: jest.fn() } as unknown as jest.Mocked<PlaybackEventsService>
  const taste = {
    markNotInterested: jest.fn(),
    unmarkNotInterested: jest.fn(),
    listNotInterested: jest.fn(),
    exclude: jest.fn(),
    include: jest.fn(),
    listExclusions: jest.fn(),
  } as unknown as jest.Mocked<TasteService>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaybackEventsController, TasteController],
      providers: [
        { provide: PlaybackEventsService, useValue: events },
        { provide: TasteService, useValue: taste },
      ],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({
        canActivate: (ctx: {
          switchToHttp: () => { getRequest: () => Record<string, unknown> }
        }) => {
          ctx.switchToHttp().getRequest().user = USER
          return true
        },
      })
      .compile()
    app = module.createNestApplication()
    await app.init()
  })

  afterAll(() => app.close())

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /me/playback-events', () => {
    it('reports a finished play for the signed-in listener', async () => {
      events.record.mockResolvedValue({ recorded: true })

      const res = await request(app.getHttpServer()).post('/me/playback-events').send(validEvent)

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ recorded: true })
      expect(events.record).toHaveBeenCalledWith(USER.id, validEvent)
    })

    it.each([
      ['an unknown source', { source: 'TELEPATHY' }],
      ['a negative listened time', { listenedMs: -1 }],
      ['a fractional listened time', { listenedMs: 1.5 }],
      ['a malformed play id', { clientPlayId: 'play-1' }],
      ['an end before the start', { endedAt: '2026-11-19T11:50:00.000Z' }],
      ['an unexpected field', { userId: ID }],
    ])('rejects %s', async (_name, change) => {
      const res = await request(app.getHttpServer())
        .post('/me/playback-events')
        .send({ ...validEvent, ...change })

      expect(res.status).toBe(400)
      expect(events.record).not.toHaveBeenCalled()
    })
  })

  describe('/me/taste', () => {
    it('marks a track "Not interested"', async () => {
      const res = await request(app.getHttpServer()).put(`/me/taste/not-interested/tracks/${ID}`)

      expect(res.status).toBe(204)
      expect(taste.markNotInterested).toHaveBeenCalledWith(USER.id, 'TRACK', ID)
    })

    it('undoes "Not interested" for an artist', async () => {
      const res = await request(app.getHttpServer()).delete(
        `/me/taste/not-interested/artists/${ID}`,
      )

      expect(res.status).toBe(204)
      expect(taste.unmarkNotInterested).toHaveBeenCalledWith(USER.id, 'ARTIST', ID)
    })

    it('excludes a playlist from the taste profile and removes the exclusion', async () => {
      await request(app.getHttpServer()).put(`/me/taste/exclusions/playlists/${ID}`).expect(204)
      await request(app.getHttpServer()).delete(`/me/taste/exclusions/playlists/${ID}`).expect(204)

      expect(taste.exclude).toHaveBeenCalledWith(USER.id, 'PLAYLIST', ID)
      expect(taste.include).toHaveBeenCalledWith(USER.id, 'PLAYLIST', ID)
    })

    it('answers 404 for a kind that cannot be hidden', async () => {
      const res = await request(app.getHttpServer()).put(`/me/taste/not-interested/playlists/${ID}`)

      expect(res.status).toBe(404)
      expect(taste.markNotInterested).not.toHaveBeenCalled()
    })

    it('rejects an id that is not a UUID', async () => {
      const res = await request(app.getHttpServer()).put('/me/taste/exclusions/albums/album-1')

      expect(res.status).toBe(400)
      expect(taste.exclude).not.toHaveBeenCalled()
    })

    it('lists hidden items with pagination', async () => {
      taste.listNotInterested.mockResolvedValue({ data: [], total: 0, page: 2, limit: 10 })

      const res = await request(app.getHttpServer()).get('/me/taste/not-interested?page=2&limit=10')

      expect(res.status).toBe(200)
      expect(taste.listNotInterested).toHaveBeenCalledWith(USER.id, 2, 10)
    })
  })
})
