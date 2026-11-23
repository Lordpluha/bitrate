import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { NotInterestedController } from './not-interested.controller'
import { NotInterestedService } from './not-interested.service'
import { TasteExclusionsController } from './taste-exclusions.controller'
import { TasteExclusionsService } from './taste-exclusions.service'

const USER = { id: '0199aee0-0000-7000-8000-000000000001' }
const ID = '0199aee0-0000-7000-8000-000000000009'

describe('/me/taste (HTTP)', () => {
  let app: INestApplication
  const notInterested = {
    mark: jest.fn(),
    unmark: jest.fn(),
    list: jest.fn(),
  } as unknown as jest.Mocked<NotInterestedService>
  const exclusions = {
    exclude: jest.fn(),
    include: jest.fn(),
    list: jest.fn(),
  } as unknown as jest.Mocked<TasteExclusionsService>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotInterestedController, TasteExclusionsController],
      providers: [
        { provide: NotInterestedService, useValue: notInterested },
        { provide: TasteExclusionsService, useValue: exclusions },
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

  it('marks a track "Not interested"', async () => {
    const res = await request(app.getHttpServer()).put(`/me/taste/not-interested/tracks/${ID}`)

    expect(res.status).toBe(204)
    expect(notInterested.mark).toHaveBeenCalledWith(USER.id, 'TRACK', ID)
  })

  it('undoes "Not interested" for an artist', async () => {
    const res = await request(app.getHttpServer()).delete(`/me/taste/not-interested/artists/${ID}`)

    expect(res.status).toBe(204)
    expect(notInterested.unmark).toHaveBeenCalledWith(USER.id, 'ARTIST', ID)
  })

  it('excludes a playlist from the taste profile and removes the exclusion', async () => {
    await request(app.getHttpServer()).put(`/me/taste/exclusions/playlists/${ID}`).expect(204)
    await request(app.getHttpServer()).delete(`/me/taste/exclusions/playlists/${ID}`).expect(204)

    expect(exclusions.exclude).toHaveBeenCalledWith(USER.id, 'PLAYLIST', ID)
    expect(exclusions.include).toHaveBeenCalledWith(USER.id, 'PLAYLIST', ID)
  })

  it('answers 404 for a kind that cannot be hidden', async () => {
    const res = await request(app.getHttpServer()).put(`/me/taste/not-interested/playlists/${ID}`)

    expect(res.status).toBe(404)
    expect(notInterested.mark).not.toHaveBeenCalled()
  })

  it('rejects an id that is not a UUID', async () => {
    const res = await request(app.getHttpServer()).put('/me/taste/exclusions/albums/album-1')

    expect(res.status).toBe(400)
    expect(exclusions.exclude).not.toHaveBeenCalled()
  })

  it('lists hidden items with pagination', async () => {
    notInterested.list.mockResolvedValue({ data: [], total: 0, page: 2, limit: 10 })

    const res = await request(app.getHttpServer()).get('/me/taste/not-interested?page=2&limit=10')

    expect(res.status).toBe(200)
    expect(notInterested.list).toHaveBeenCalledWith(USER.id, 2, 10)
  })
})
