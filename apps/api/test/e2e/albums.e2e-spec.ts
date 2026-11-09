import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { closeE2eApp, createE2eApp, makeRunId, registerAndLogin } from './e2e-app'

// Well-formed v4 UUID that matches no album; ParseUUIDPipe rejects ids without a valid version.
const MISSING_ALBUM_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'

let app: INestApplication

/** Artist-side album writes left the public API (#467): albums come from releases. */
const seedAlbum = async (title: string) => {
  const prisma = app.get(PrismaService)
  const { email } = await registerAndLogin(app, 'artist')
  const artist = await prisma.artist.findFirstOrThrow({ where: { email }, select: { id: true } })
  return prisma.album.create({ data: { title, artistId: artist.id }, select: { id: true } })
}

describe('AlbumsController (e2e)', () => {
  beforeAll(async () => {
    const setup = await createE2eApp()
    app = setup.app
  })

  afterAll(async () => {
    await closeE2eApp(app)
  })

  it('reads a published album through the listener routes', async () => {
    const album = await seedAlbum(`Listener Album ${makeRunId()}`)

    await request(app.getHttpServer()).get('/albums').query({ page: 1, limit: 10 }).expect(200)
    await request(app.getHttpServer()).get(`/albums/${album.id}`).expect(200)
  })

  it.each([
    ['support title filter', 'Rock Album'],
    ['filter case-insensitively', 'RoCk Case'],
  ])('GET /albums should %s', async (_label, prefix) => {
    await seedAlbum(`${prefix} ${makeRunId()}`)

    const response = await request(app.getHttpServer())
      .get('/albums')
      .query({ title: 'rock', page: 1, limit: 10 })
      .expect(200)

    expect(Array.isArray(response.body.data)).toBe(true)
    expect(
      response.body.data.some((album: { title?: string }) =>
        album.title?.toLowerCase().includes('rock'),
      ),
    ).toBe(true)
  })

  it('GET /albums should accept pagination boundaries', async () => {
    await request(app.getHttpServer()).get('/albums').query({ page: 1, limit: 1 }).expect(200)
  })

  it('GET /albums should reject invalid pagination', async () => {
    await request(app.getHttpServer()).get('/albums').query({ page: 'nope' }).expect(400)
  })

  it('GET /albums/:id should reject invalid uuid', async () => {
    await request(app.getHttpServer()).get('/albums/not-uuid').expect(400)
  })

  it('GET /albums/:id should return empty body for missing album', async () => {
    const response = await request(app.getHttpServer())
      .get(`/albums/${MISSING_ALBUM_ID}`)
      .expect(200)

    expect(response.body).toEqual({})
  })

  it('no longer serves artist album writes, even to a signed-in artist', async () => {
    const { cookies } = await registerAndLogin(app, 'artist')
    const server = app.getHttpServer()

    await request(server)
      .post('/albums')
      .set('Cookie', cookies)
      .send({ title: 'Gone', rightsConfirmed: true })
      .expect(404)
    await request(server)
      .put(`/albums/${MISSING_ALBUM_ID}`)
      .set('Cookie', cookies)
      .send({ title: 'Gone' })
      .expect(404)
    await request(server).delete(`/albums/${MISSING_ALBUM_ID}`).set('Cookie', cookies).expect(404)
  })
})
