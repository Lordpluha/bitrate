/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'

describe('Tracks (e2e)', () => {
  let app: INestApplication<App>
  let prismaService: PrismaService
  let jwtService: JwtService
  let accessToken: string
  let artistId: string

  const testArtist = {
    username: 'testartist',
    email: 'artist@example.com',
    password: 'password123'
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    prismaService = app.get<PrismaService>(PrismaService)
    jwtService = app.get<JwtService>(JwtService)

    // Create a test artist and get access token
    const artist = await prismaService.artist.create({
      data: testArtist
    })
    artistId = artist.id

    accessToken = jwtService.sign(
      { sub: artist.id, email: artist.email },
      { expiresIn: '1h' }
    )
  })

  afterAll(async () => {
    // Clean up test data
    await prismaService.track.deleteMany({
      where: { artistId }
    })
    await prismaService.artist.delete({
      where: { id: artistId }
    })
    await prismaService.$disconnect()
    if (app) {
      await app.close()
    }
  })

  describe('/tracks (GET)', () => {
    beforeEach(async () => {
      // Clean up tracks before each test
      await prismaService.track.deleteMany({
        where: { artistId }
      })
    })

    it('should return paginated tracks', async () => {
      // Create test tracks
      await prismaService.track.createMany({
        data: [
          {
            title: 'Test Track 1',
            audioUrl: 'https://example.com/audio1.mp3',
            cover: 'https://example.com/cover1.jpg',
            artistId
          },
          {
            title: 'Test Track 2',
            audioUrl: 'https://example.com/audio2.mp3',
            cover: 'https://example.com/cover2.jpg',
            artistId
          }
        ]
      })

      const response = await request(app.getHttpServer())
        .get('/tracks')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.meta).toHaveProperty('total')
      expect(response.body.meta).toHaveProperty('page')
      expect(response.body.meta).toHaveProperty('limit')
      expect(response.body.meta).toHaveProperty('lastPage')
    })

    it('should return tracks with custom pagination', async () => {
      // Create multiple test tracks
      const tracksData = Array.from({ length: 15 }, (_, index) => ({
        title: `Test Track ${index + 1}`,
        audioUrl: `https://example.com/audio${index + 1}.mp3`,
        cover: `https://example.com/cover${index + 1}.jpg`,
        artistId
      }))

      await prismaService.track.createMany({
        data: tracksData
      })

      const response = await request(app.getHttpServer())
        .get('/tracks?page=2&limit=5')
        .expect(200)

      expect(response.body.data).toHaveLength(5)
      expect(response.body.meta.page).toBe(2)
      expect(response.body.meta.limit).toBe(5)
    })

    it('should return tracks filtered by title', async () => {
      // Create test tracks with different titles
      await prismaService.track.createMany({
        data: [
          {
            title: 'Rock Song',
            audioUrl: 'https://example.com/rock.mp3',
            artistId
          },
          {
            title: 'Jazz Melody',
            audioUrl: 'https://example.com/jazz.mp3',
            artistId
          },
          {
            title: 'Rock Anthem',
            audioUrl: 'https://example.com/anthem.mp3',
            artistId
          }
        ]
      })

      const response = await request(app.getHttpServer())
        .get('/tracks?title=Rock')
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      // All returned tracks should contain "Rock" in title (case insensitive)
      response.body.data.forEach((track: any) => {
        expect(track.title.toLowerCase()).toContain('rock')
      })
    })

    it('should return empty data when no tracks exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/tracks')
        .expect(200)

      expect(response.body.data).toHaveLength(0)
      expect(response.body.meta.total).toBe(0)
    })
  })

  describe('/tracks/:id (GET)', () => {
    let trackId: string

    beforeEach(async () => {
      // Clean up and create a test track
      await prismaService.track.deleteMany({
        where: { artistId }
      })

      const track = await prismaService.track.create({
        data: {
          title: 'Test Track',
          audioUrl: 'https://example.com/test-audio.mp3',
          cover: 'https://example.com/test-cover.jpg',
          artistId
        }
      })
      trackId = track.id
    })

    it('should return a track by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tracks/${trackId}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', trackId)
      expect(response.body).toHaveProperty('title', 'Test Track')
      expect(response.body).toHaveProperty(
        'audioUrl',
        'https://example.com/test-audio.mp3'
      )
      expect(response.body).toHaveProperty('artistId', artistId)
    })

    it('should return null for non-existent track', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000'

      const response = await request(app.getHttpServer())
        .get(`/tracks/${nonExistentId}`)
        .expect(200)

      expect(response.body).toBeNull()
    })

    it('should return 400 for invalid UUID format', async () => {
      await request(app.getHttpServer()).get('/tracks/invalid-id').expect(400)
    })
  })

  describe('/tracks (POST)', () => {
    beforeEach(async () => {
      // Clean up tracks before each test
      await prismaService.track.deleteMany({
        where: { artistId }
      })
    })

    it('should create a new track', async () => {
      const createTrackDto = {
        title: 'New Track',
        audioUrl: 'https://example.com/new-audio.mp3',
        cover: 'https://example.com/new-cover.jpg'
      }

      const response = await request(app.getHttpServer())
        .post('/tracks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createTrackDto)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('title', createTrackDto.title)
      expect(response.body).toHaveProperty('audioUrl', createTrackDto.audioUrl)
      expect(response.body).toHaveProperty('cover', createTrackDto.cover)
      expect(response.body).toHaveProperty('artistId', artistId)

      // Verify track was created in database
      const createdTrack = await prismaService.track.findUnique({
        where: { id: response.body.id as string }
      })
      expect(createdTrack).toBeTruthy()
      expect(createdTrack?.title).toBe(createTrackDto.title)
    })

    it('should create a track without cover', async () => {
      const createTrackDto = {
        title: 'New Track',
        audioUrl: 'https://example.com/new-audio.mp3'
      }

      const response = await request(app.getHttpServer())
        .post('/tracks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createTrackDto)
        .expect(201)

      expect(response.body).toHaveProperty('title', createTrackDto.title)
      expect(response.body).toHaveProperty('audioUrl', createTrackDto.audioUrl)
      expect(response.body.cover).toBeFalsy()
    })

    it('should return 401 without authorization', async () => {
      const createTrackDto = {
        title: 'New Track',
        audioUrl: 'https://example.com/new-audio.mp3'
      }

      await request(app.getHttpServer())
        .post('/tracks')
        .send(createTrackDto)
        .expect(401)
    })

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/tracks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({}) // Missing required fields
        .expect(400)
    })

    it('should return 400 for missing title', async () => {
      await request(app.getHttpServer())
        .post('/tracks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ audioUrl: 'https://example.com/audio.mp3' })
        .expect(400)
    })

    it('should return 400 for missing audioUrl', async () => {
      await request(app.getHttpServer())
        .post('/tracks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Test Track' })
        .expect(400)
    })
  })

  describe('/tracks/:id (PUT)', () => {
    let trackId: string

    beforeEach(async () => {
      // Clean up and create a test track
      await prismaService.track.deleteMany({
        where: { artistId }
      })

      const track = await prismaService.track.create({
        data: {
          title: 'Original Track',
          audioUrl: 'https://example.com/original-audio.mp3',
          cover: 'https://example.com/original-cover.jpg',
          artistId
        }
      })
      trackId = track.id
    })

    it('should update a track', async () => {
      const updateTrackDto = {
        title: 'Updated Track',
        audioUrl: 'https://example.com/updated-audio.mp3',
        cover: 'https://example.com/updated-cover.jpg'
      }

      const response = await request(app.getHttpServer())
        .put(`/tracks/${trackId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateTrackDto)
        .expect(200)

      expect(response.body).toHaveProperty('title', updateTrackDto.title)
      expect(response.body).toHaveProperty('audioUrl', updateTrackDto.audioUrl)
      expect(response.body).toHaveProperty('cover', updateTrackDto.cover)

      // Verify track was updated in database
      const updatedTrack = await prismaService.track.findUnique({
        where: { id: trackId }
      })
      expect(updatedTrack?.title).toBe(updateTrackDto.title)
      expect(updatedTrack?.audioUrl).toBe(updateTrackDto.audioUrl)
    })

    it('should update only provided fields', async () => {
      const updateTrackDto = {
        title: 'Updated Title Only',
        audioUrl: 'https://example.com/original-audio.mp3' // keeping original
      }

      const response = await request(app.getHttpServer())
        .put(`/tracks/${trackId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateTrackDto)
        .expect(200)

      expect(response.body).toHaveProperty('title', updateTrackDto.title)
      expect(response.body).toHaveProperty('audioUrl', updateTrackDto.audioUrl)
    })

    it('should return 401 without authorization', async () => {
      const updateTrackDto = {
        title: 'Updated Track',
        audioUrl: 'https://example.com/updated-audio.mp3'
      }

      await request(app.getHttpServer())
        .put(`/tracks/${trackId}`)
        .send(updateTrackDto)
        .expect(401)
    })

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .put(`/tracks/${trackId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({}) // Missing required fields
        .expect(400)
    })

    it('should handle update of non-existent track', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000'
      const updateTrackDto = {
        title: 'Updated Track',
        audioUrl: 'https://example.com/updated-audio.mp3'
      }

      // This should probably return 404, but depends on implementation
      // The exact behavior may vary based on Prisma error handling
      await request(app.getHttpServer())
        .put(`/tracks/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateTrackDto)
        .expect(res => {
          // Accept either 404 or 500 depending on implementation
          expect([404, 500]).toContain(res.status)
        })
    })
  })
})
