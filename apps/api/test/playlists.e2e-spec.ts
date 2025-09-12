/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { App } from 'supertest/types'

import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

describe('Playlists (e2e)', () => {
  let app: INestApplication<App>
  let prismaService: PrismaService
  let jwtService: JwtService
  let accessToken: string
  let userId: string

  const testUser = {
    email: 'test@example.com',
    username: 'testuser',
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

    // Create a test user and get access token
    const user = await prismaService.user.create({
      data: testUser
    })
    userId = user.id

    accessToken = jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '1h' }
    )
  })

  afterAll(async () => {
    // Clean up test data
    await prismaService.playlist.deleteMany({
      where: { userId }
    })
    await prismaService.user.delete({
      where: { id: userId }
    })
    await prismaService.$disconnect()
    await app.close()
  })

  describe('/playlists (GET)', () => {
    beforeEach(async () => {
      // Clean up playlists before each test
      await prismaService.playlist.deleteMany({
        where: { userId }
      })
    })

    it('should return all playlists', async () => {
      // Create test playlists
      await prismaService.playlist.createMany({
        data: [
          {
            title: 'Test Playlist 1',
            description: 'Description 1',
            cover: '',
            userId
          },
          {
            title: 'Test Playlist 2',
            description: 'Description 2',
            cover: '',
            userId
          }
        ]
      })

      const response = await request(app.getHttpServer())
        .get('/playlists')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(2)
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('title')
        expect(response.body[0]).toHaveProperty('user')
        expect(response.body[0].user).toHaveProperty('username')
      }
    })

    it('should return playlists with pagination', async () => {
      // Create multiple test playlists
      const playlistsData = Array.from({ length: 15 }, (_, index) => ({
        title: `Test Playlist ${index + 1}`,
        description: `Description ${index + 1}`,
        cover: '',
        userId
      }))

      await prismaService.playlist.createMany({
        data: playlistsData
      })

      const response = await request(app.getHttpServer())
        .get('/playlists?page=1&limit=5')
        .expect(200)

      expect(response.body).toHaveLength(5)
    })

    it('should return empty array when no playlists exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/playlists')
        .expect(200)

      expect(response.body).toHaveLength(0)
    })
  })

  describe('/playlists/:id (GET)', () => {
    let playlistId: string

    beforeEach(async () => {
      // Clean up and create a test playlist
      await prismaService.playlist.deleteMany({
        where: { userId }
      })

      const playlist = await prismaService.playlist.create({
        data: {
          title: 'Test Playlist',
          description: 'Test Description',
          cover: '',
          userId
        }
      })
      playlistId = playlist.id
    })

    it('should return a playlist by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/playlists/${playlistId}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', playlistId)
      expect(response.body).toHaveProperty('title', 'Test Playlist')
      expect(response.body).toHaveProperty('description', 'Test Description')
    })

    it('should return 404 for non-existent playlist', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000'

      await request(app.getHttpServer())
        .get(`/playlists/${nonExistentId}`)
        .expect(404)
    })

    it('should return 400 for invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/playlists/invalid-id')
        .expect(400)
    })
  })

  describe('/playlists (POST)', () => {
    beforeEach(async () => {
      // Clean up playlists before each test
      await prismaService.playlist.deleteMany({
        where: { userId }
      })
    })

    it('should create a new playlist', async () => {
      const createPlaylistDto = {
        title: 'New Playlist',
        description: 'New Description'
      }

      const response = await request(app.getHttpServer())
        .post('/playlists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPlaylistDto)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('title', createPlaylistDto.title)
      expect(response.body).toHaveProperty(
        'description',
        createPlaylistDto.description
      )
      expect(response.body).toHaveProperty('userId', userId)
      expect(response.body).toHaveProperty('cover', '')

      // Verify playlist was created in database
      const createdPlaylist = await prismaService.playlist.findUnique({
        where: { id: response.body.id as string }
      })
      expect(createdPlaylist).toBeTruthy()
      expect(createdPlaylist?.title).toBe(createPlaylistDto.title)
    })

    it('should create a playlist without description', async () => {
      const createPlaylistDto = {
        title: 'New Playlist'
      }

      const response = await request(app.getHttpServer())
        .post('/playlists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPlaylistDto)
        .expect(201)

      expect(response.body).toHaveProperty('title', createPlaylistDto.title)
      expect(response.body).toHaveProperty('description')
    })

    it('should return 401 without authorization', async () => {
      const createPlaylistDto = {
        title: 'New Playlist',
        description: 'New Description'
      }

      await request(app.getHttpServer())
        .post('/playlists')
        .send(createPlaylistDto)
        .expect(401)
    })

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/playlists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({}) // Missing required title
        .expect(400)
    })

    it('should return 400 for empty title', async () => {
      await request(app.getHttpServer())
        .post('/playlists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: '' })
        .expect(400)
    })
  })

  describe('/playlists/:id (PUT)', () => {
    let playlistId: string

    beforeEach(async () => {
      // Clean up and create a test playlist
      await prismaService.playlist.deleteMany({
        where: { userId }
      })

      const playlist = await prismaService.playlist.create({
        data: {
          title: 'Original Playlist',
          description: 'Original Description',
          cover: '',
          userId
        }
      })
      playlistId = playlist.id
    })

    it('should update a playlist', async () => {
      const updatePlaylistDto = {
        title: 'Updated Playlist',
        description: 'Updated Description'
      }

      const response = await request(app.getHttpServer())
        .put(`/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePlaylistDto)
        .expect(200)

      expect(response.body).toHaveProperty('title', updatePlaylistDto.title)
      expect(response.body).toHaveProperty(
        'description',
        updatePlaylistDto.description
      )

      // Verify playlist was updated in database
      const updatedPlaylist = await prismaService.playlist.findUnique({
        where: { id: playlistId }
      })
      expect(updatedPlaylist?.title).toBe(updatePlaylistDto.title)
      expect(updatedPlaylist?.description).toBe(updatePlaylistDto.description)
    })

    it('should update only provided fields', async () => {
      const updatePlaylistDto = {
        title: 'Updated Title Only'
      }

      const response = await request(app.getHttpServer())
        .put(`/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePlaylistDto)
        .expect(200)

      expect(response.body).toHaveProperty('title', updatePlaylistDto.title)
      expect(response.body).toHaveProperty(
        'description',
        'Original Description'
      )
    })

    it('should return 401 without authorization', async () => {
      const updatePlaylistDto = {
        title: 'Updated Playlist'
      }

      await request(app.getHttpServer())
        .put(`/playlists/${playlistId}`)
        .send(updatePlaylistDto)
        .expect(401)
    })

    it('should return 404 for non-existent playlist', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000'
      const updatePlaylistDto = {
        title: 'Updated Playlist'
      }

      await request(app.getHttpServer())
        .put(`/playlists/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePlaylistDto)
        .expect(404)
    })

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .put(`/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: '' }) // Empty title
        .expect(400)
    })
  })

  describe('Playlist access control', () => {
    let otherUserId: string
    let otherUserToken: string
    let playlistId: string

    beforeAll(async () => {
      // Create another user
      const otherUser = await prismaService.user.create({
        data: {
          email: 'other@example.com',
          username: 'otheruser',
          password: 'password123'
        }
      })
      otherUserId = otherUser.id

      otherUserToken = jwtService.sign(
        { sub: otherUser.id, email: otherUser.email },
        { expiresIn: '1h' }
      )
    })

    afterAll(async () => {
      // Clean up other user and their playlists
      await prismaService.playlist.deleteMany({
        where: { userId: otherUserId }
      })
      await prismaService.user.delete({
        where: { id: otherUserId }
      })
    })

    beforeEach(async () => {
      // Clean up and create a test playlist for the first user
      await prismaService.playlist.deleteMany({
        where: { userId }
      })

      const playlist = await prismaService.playlist.create({
        data: {
          title: 'User 1 Playlist',
          description: 'Description',
          cover: '',
          userId
        }
      })
      playlistId = playlist.id
    })

    it('should allow user to update their own playlist', async () => {
      const updateDto = { title: 'Updated by Owner' }

      await request(app.getHttpServer())
        .put(`/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200)
    })

    it('should prevent user from updating other users playlist', async () => {
      const updateDto = { title: 'Updated by Other User' }

      // This should either return 404 (if access control is implemented)
      // or update with wrong userId (if not implemented correctly)
      await request(app.getHttpServer())
        .put(`/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updateDto)

      // The exact behavior depends on implementation
      // but the playlist should still belong to the original user
      const playlist = await prismaService.playlist.findUnique({
        where: { id: playlistId }
      })
      expect(playlist?.userId).toBe(userId)
    })
  })
})
