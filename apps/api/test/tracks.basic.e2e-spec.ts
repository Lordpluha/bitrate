/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('Tracks Basic Integration Tests (e2e)', () => {
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

  describe('/tracks (GET)', () => {
    it('should return paginated tracks', async () => {
      const response = await request(app.getHttpServer())
        .get('/tracks')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/tracks?page=1&limit=5')
        .expect(200)

      expect(response.body.meta).toHaveProperty('page', 1)
      expect(response.body.meta).toHaveProperty('limit', 5)
    })

    it('should handle title filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/tracks?title=test')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('/tracks (POST)', () => {
    it('should require authentication to create track', async () => {
      const createTrackDto = {
        title: 'Test Track',
        audioUrl: 'https://example.com/audio.mp3'
      }

      await request(app.getHttpServer())
        .post('/tracks')
        .send(createTrackDto)
        .expect(401)
    })
  })

  describe('/tracks/:id (PUT)', () => {
    it('should require authentication to update track', async () => {
      const updateTrackDto = {
        title: 'Updated Track',
        audioUrl: 'https://example.com/updated-audio.mp3'
      }

      await request(app.getHttpServer())
        .put('/tracks/123e4567-e89b-12d3-a456-426614174000')
        .send(updateTrackDto)
        .expect(401)
    })
  })

  describe('/tracks/:id (GET)', () => {
    it('should handle invalid UUID format', async () => {
      await request(app.getHttpServer()).get('/tracks/invalid-id').expect(400)
    })

    it('should return empty response for non-existent track', async () => {
      const response = await request(app.getHttpServer())
        .get('/tracks/123e4567-e89b-12d3-a456-426614174000')
        .expect(200)

      // When Prisma returns null, NestJS may serialize it as empty object
      expect(
        response.body === null ||
          (typeof response.body === 'object' &&
            Object.keys(response.body as object).length === 0)
      ).toBe(true)
    })
  })
})
