import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('Playlists Integration Tests (e2e)', () => {
  let app: INestApplication<App>

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  describe('/playlists (GET)', () => {
    it('should return playlists list', async () => {
      const response = await request(app.getHttpServer())
        .get('/playlists')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('/playlists (POST)', () => {
    it('should require authentication to create playlist', async () => {
      const createPlaylistDto = {
        title: 'Test Playlist',
        description: 'Test Description'
      }

      await request(app.getHttpServer())
        .post('/playlists')
        .send(createPlaylistDto)
        .expect(401)
    })
  })
})
