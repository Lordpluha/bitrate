import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import { Test, TestingModule } from '@nestjs/testing'
import { PLAYLIST_ID, USER_ID } from '@test/fixtures/playlists'
import 'dotenv/config'
import { PlaylistsService } from '../../playlists.service'

describe('PlaylistsService (integration)', () => {
  let prisma: PrismaService
  let service: PlaylistsService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, PlaylistsService],
    }).compile()

    prisma = moduleFixture.get(PrismaService)
    service = moduleFixture.get(PlaylistsService)

    await prisma.onModuleInit()
  })

  beforeEach(async () => {
    await prisma.playlist.deleteMany()
    await prisma.userSession.deleteMany()
    await prisma.user.deleteMany()

    await prisma.user.create({
      data: {
        id: USER_ID,
        username: 'user',
        email: 'user@example.com',
        password: 'password123',
      },
    })

    await prisma.playlist.create({
      data: {
        id: PLAYLIST_ID,
        title: 'Seed Playlist',
        cover: 'cover.png',
        userId: USER_ID,
        description: null,
      },
    })
  })

  afterAll(async () => {
    await prisma.playlist.deleteMany()
    await prisma.userSession.deleteMany()
    await prisma.user.deleteMany()
    await prisma.onModuleDestroy()
  })

  it('getAll should read from database', async () => {
    const result = await service.getAll({ page: 1, limit: 10 })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: PLAYLIST_ID,
      title: 'Seed Playlist',
      user: { id: USER_ID, username: 'user' },
    })
  })

  it('getById should return playlist from database', async () => {
    const result = await service.getById(PLAYLIST_ID)

    expect(result).toMatchObject({
      id: PLAYLIST_ID,
      title: 'Seed Playlist',
      userId: USER_ID,
    })
  })

  it('getByIdPopulated should include tracks', async () => {
    const result = await service.getByIdPopulated(PLAYLIST_ID)

    expect(result).toMatchObject({
      id: PLAYLIST_ID,
      title: 'Seed Playlist',
      userId: USER_ID,
    })
    expect(Array.isArray(result.tracks)).toBe(true)
  })

  it('create should persist playlist in database', async () => {
    const created = await service.create(USER_ID, {
      title: 'Created Playlist',
      description: 'desc',
    })

    expect(created).toMatchObject({
      title: 'Created Playlist',
      userId: USER_ID,
    })

    const stored = await prisma.playlist.findUnique({ where: { id: created.id } })
    expect(stored).not.toBeNull()
    expect(stored?.description).toBe('desc')
    expect(stored?.cover).toBe('')
  })

  it('update should persist changes in database', async () => {
    const updated = await service.update(USER_ID, PLAYLIST_ID, {
      title: 'Updated Playlist',
      description: 'updated desc',
    })

    expect(updated).toMatchObject({
      id: PLAYLIST_ID,
      title: 'Updated Playlist',
      description: 'updated desc',
      userId: USER_ID,
    })

    const stored = await prisma.playlist.findUnique({ where: { id: PLAYLIST_ID } })
    expect(stored?.title).toBe('Updated Playlist')
    expect(stored?.description).toBe('updated desc')
  })

  it('delete should remove playlist from database', async () => {
    const deleted = await service.delete(USER_ID, PLAYLIST_ID)

    expect(deleted).toMatchObject({
      id: PLAYLIST_ID,
      title: 'Seed Playlist',
    })

    const stored = await prisma.playlist.findUnique({ where: { id: PLAYLIST_ID } })
    expect(stored).toBeNull()
  })

  it('delete should reject other user', async () => {
    await expect(
      service.delete('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', PLAYLIST_ID),
    ).rejects.toThrow()
  })
})
