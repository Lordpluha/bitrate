/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { App } from 'supertest/types'

import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

describe('TracksController (e2e)', () => {
  let app: INestApplication<App>
  let prismaService: PrismaService
  let jwtService: JwtService
  let accessToken: string
  let userId: string
  let artistId: string
  let trackId: string

  const testUser = {
    email: 'testartist@example.com',
    username: 'testartist',
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

    // Create a test user who will act as artist
    const user = await prismaService.user.create({
      data: testUser
    })
    userId = user.id

    // Create artist with same ID as user (system treats users as artists for track creation)
    const artist = await prismaService.artist.create({
      data: {
        id: user.id, // Use same ID as user for authentication compatibility
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        bio: 'Test artist bio'
      }
    })
    artistId = artist.id

    // Generate access token
    accessToken = jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '1h' }
    )

    // Create session in database for token validation
    await prismaService.session.create({
      data: {
        userId: user.id,
        access_token: accessToken,
        refresh_token: 'test-refresh-token'
      }
    })
  })

  beforeEach(async () => {
    // Clean up tracks before each test
    await prismaService.track.deleteMany({
      where: { artistId }
    })
  })

  afterAll(async () => {
    // Clean up test data
    await prismaService.track.deleteMany({
      where: { artistId }
    })
    await prismaService.session.deleteMany({
      where: { userId }
    })
    await prismaService.artist.delete({
      where: { id: artistId }
    })
    await prismaService.user.delete({
      where: { id: userId }
    })
    await prismaService.$disconnect()
    await app.close()
  })

  describe('POST /tracks', () => {
    it('should create a new track', async () => {
      const createTrackDto = {
        title: 'Test Track',
        audioUrl: 'https://example.com/test-track.mp3',
        cover: 'https://example.com/cover.jpg'
      }

      const response = await request(app.getHttpServer())
        .post('/tracks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createTrackDto)
        .expect(201)

      trackId = response.body.id as string

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('title', createTrackDto.title)
      expect(response.body).toHaveProperty('audioUrl', createTrackDto.audioUrl)
      expect(response.body).toHaveProperty('cover', createTrackDto.cover)
      expect(response.body).toHaveProperty('artistId', artistId)
      expect(response.body).toHaveProperty('createdAt')
    })

    it('should return 400 for invalid track data', async () => {
      const invalidTrackDto = {
        // Missing required fields title and audioUrl
        cover: ''
      }

      await request(app.getHttpServer())
        .post('/tracks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidTrackDto)
        .expect(400)
    })

    it('should return 401 without authentication', async () => {
      const createTrackDto = {
        title: 'Test Track',
        audioUrl: 'https://example.com/test-track.mp3'
      }

      await request(app.getHttpServer())
        .post('/tracks')
        .send(createTrackDto)
        .expect(401)
    })
  })

  describe('GET /tracks', () => {
    beforeEach(async () => {
      // Create test tracks
      const track1 = await prismaService.track.create({
        data: {
          title: 'Test Track 1',
          audioUrl: 'https://example.com/track1.mp3',
          artistId,
          cover: 'https://example.com/cover1.jpg'
        }
      })

      await prismaService.track.create({
        data: {
          title: 'Test Track 2',
          audioUrl: 'https://example.com/track2.mp3',
          artistId,
          cover: 'https://example.com/cover2.jpg'
        }
      })

      trackId = track1.id // Store for cleanup
    })

    it('should get all tracks with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/tracks?page=1&limit=10')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.meta).toHaveProperty('page', 1)
      expect(response.body.meta).toHaveProperty('limit', 10)
    })

    it('should get tracks with search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/tracks?title=Test Track 1')
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0]).toHaveProperty('title', 'Test Track 1')
    })

    it('should return empty results for non-existent search', async () => {
      const response = await request(app.getHttpServer())
        .get('/tracks?title=Non-existent Track')
        .expect(200)

      expect(response.body.data).toHaveLength(0)
    })
  })

  describe('GET /tracks/:id', () => {
    beforeEach(async () => {
      const track = await prismaService.track.create({
        data: {
          title: 'Test Track Detail',
          audioUrl: 'https://example.com/track-detail.mp3',
          artistId,
          cover: 'https://example.com/cover-detail.jpg'
        }
      })
      trackId = track.id
    })

    it('should get track by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tracks/${trackId}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', trackId)
      expect(response.body).toHaveProperty('title', 'Test Track Detail')
      expect(response.body).toHaveProperty(
        'audioUrl',
        'https://example.com/track-detail.mp3'
      )
      expect(response.body).toHaveProperty('artistId', artistId)
    })

    it('should return null for non-existent track', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000'

      const response = await request(app.getHttpServer())
        .get(`/tracks/${nonExistentId}`)
        .expect(200)

      expect(response.body).toEqual({})
    })

    it('should return 400 for invalid track id format', async () => {
      await request(app.getHttpServer()).get('/tracks/invalid-id').expect(400)
    })
  })

  describe('PUT /tracks/:id', () => {
    beforeEach(async () => {
      const track = await prismaService.track.create({
        data: {
          title: 'Track to Update',
          audioUrl: 'https://example.com/track-update.mp3',
          artistId,
          cover: 'https://example.com/cover-update.jpg'
        }
      })
      trackId = track.id
    })

    it('should update track', async () => {
      const updateData = {
        title: 'Updated Track Title',
        audioUrl: 'https://example.com/track-update.mp3',
        cover: 'https://example.com/updated-cover.jpg'
      }

      const response = await request(app.getHttpServer())
        .put(`/tracks/${trackId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('title', updateData.title)
      expect(response.body).toHaveProperty('cover', updateData.cover)
      expect(response.body).toHaveProperty('id', trackId)
    })

    it('should return 401 without authentication', async () => {
      const updateData = {
        title: 'Updated Title',
        audioUrl: 'https://example.com/track-update.mp3'
      }

      await request(app.getHttpServer())
        .put(`/tracks/${trackId}`)
        .send(updateData)
        .expect(401)
    })

    it('should return 500 for non-existent track', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData = {
        title: 'Updated Title',
        audioUrl: 'https://example.com/track-update.mp3'
      }

      await request(app.getHttpServer())
        .put(`/tracks/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(500)
    })

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        // Missing required fields
        cover: 'some-cover.jpg'
      }

      await request(app.getHttpServer())
        .put(`/tracks/${trackId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData)
        .expect(400)
    })
  })
})
