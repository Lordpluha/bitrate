import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { PlaybackEventsController } from './playback-events.controller'
import { PlaybackEventsService } from './playback-events.service'

const USER = { id: '0199aee0-0000-7000-8000-000000000001' }

const validEvent = {
  clientPlayId: '0199aee0-0000-7000-8000-000000000003',
  trackId: '0199aee0-0000-7000-8000-000000000002',
  startedAt: '2026-11-19T11:55:00.000Z',
  endedAt: '2026-11-19T11:58:00.000Z',
  listenedMs: 180_000,
  endReason: 'SKIPPED',
  source: 'RADIO',
} as const

describe('POST /me/playback-events (HTTP)', () => {
  let app: INestApplication
  const events = { record: jest.fn() } as unknown as jest.Mocked<PlaybackEventsService>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaybackEventsController],
      providers: [{ provide: PlaybackEventsService, useValue: events }],
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
    ['an unexpected field', { userId: USER.id }],
  ])('rejects %s', async (_name, change) => {
    const res = await request(app.getHttpServer())
      .post('/me/playback-events')
      .send({ ...validEvent, ...change })

    expect(res.status).toBe(400)
    expect(events.record).not.toHaveBeenCalled()
  })
})
