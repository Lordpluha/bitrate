import type { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { resetDatabase } from '../helpers/db'
import { closeE2eApp, createE2eApp, getResponseCookies } from './e2e-app'

const makeRunId = () => Math.random().toString(36).slice(2, 8)

const registerAndLogin = async (app: INestApplication, prisma: PrismaService, runId: string) => {
  const credentials = {
    email: `search_${runId}@example.com`,
    password: 'password123',
    username: `search_${runId}`,
  }
  await request(app.getHttpServer()).post('/auth/registration').send(credentials).expect(201)
  await prisma.user.update({
    where: { email: credentials.email },
    data: { emailVerifiedAt: new Date() },
  })
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: credentials.email, password: credentials.password })
    .expect(201)

  return getResponseCookies(response.headers['set-cookie'])
}

describe('Search and listening history (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const setup = await createE2eApp()
    app = setup.app
    prisma = setup.prisma
  })

  afterAll(async () => closeE2eApp(app))

  beforeEach(async () => resetDatabase(prisma))

  it('searches across entities, returns a top result, and records search history', async () => {
    const runId = makeRunId()
    const cookies = await registerAndLogin(app, prisma, runId)
    const artist = await prisma.artist.create({
      data: {
        email: `artist_${runId}@example.com`,
        username: `Aurora ${runId}`,
        emailVerifiedAt: new Date(),
      },
    })
    const track = await prisma.track.create({
      data: {
        title: `Northern Lights ${runId}`,
        audioUrl: 'storage/test.opus',
        artistId: artist.id,
        processingStatus: 'READY',
      },
    })

    const searchResponse = await request(app.getHttpServer())
      .get('/search')
      .query({ q: `Northern Lights ${runId}`, types: 'tracks', page: 1, limit: 5 })
      .set('Cookie', cookies)
      .expect(200)

    expect(searchResponse.body).toMatchObject({
      total: 1,
      page: 1,
      limit: 5,
      topResult: { id: track.id, type: 'tracks' },
    })
    expect(searchResponse.body.data.tracks).toHaveLength(1)

    const historyResponse = await request(app.getHttpServer())
      .get('/search/history')
      .set('Cookie', cookies)
      .expect(200)

    expect(historyResponse.body).toMatchObject({ total: 1, page: 1, limit: 20 })
    expect(historyResponse.body.data[0].query).toBe(`Northern Lights ${runId}`)

    await request(app.getHttpServer()).delete('/search/history').set('Cookie', cookies).expect(200)
    expect(await prisma.searchHistory.count()).toBe(0)
  })

  it('records, paginates, removes, and clears listening history', async () => {
    const runId = makeRunId()
    const cookies = await registerAndLogin(app, prisma, runId)
    const artist = await prisma.artist.create({
      data: {
        email: `history_artist_${runId}@example.com`,
        username: `History Artist ${runId}`,
        emailVerifiedAt: new Date(),
      },
    })
    const track = await prisma.track.create({
      data: {
        title: `History Track ${runId}`,
        audioUrl: 'storage/history.opus',
        artistId: artist.id,
        processingStatus: 'READY',
      },
    })

    await request(app.getHttpServer())
      .post(`/history/tracks/${track.id}`)
      .set('Cookie', cookies)
      .expect(201)

    const historyResponse = await request(app.getHttpServer())
      .get('/history')
      .query({ page: 1, limit: 10 })
      .set('Cookie', cookies)
      .expect(200)

    expect(historyResponse.body).toMatchObject({ total: 1, page: 1, limit: 10 })
    expect(historyResponse.body.data[0].track.id).toBe(track.id)

    await request(app.getHttpServer())
      .delete(`/history/tracks/${track.id}`)
      .set('Cookie', cookies)
      .expect(200)
    expect(await prisma.listeningHistory.count()).toBe(0)

    await request(app.getHttpServer()).delete('/history').set('Cookie', cookies).expect(204)
  })
})
