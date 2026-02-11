import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import { Test, TestingModule } from '@nestjs/testing'
import { ALBUM_ID, ARTIST_ID } from '@test/fixtures/albums'
import 'dotenv/config'
import { AlbumsService } from '../../albums.service'

describe('AlbumsService (integration)', () => {
  let prisma: PrismaService
  let service: AlbumsService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, AlbumsService],
    }).compile()

    prisma = moduleFixture.get(PrismaService)
    service = moduleFixture.get(AlbumsService)

    await prisma.onModuleInit()
  })

  beforeEach(async () => {
    await prisma.album.deleteMany()
    await prisma.artist.deleteMany()

    await prisma.artist.create({
      data: {
        id: ARTIST_ID,
        username: 'artist',
        email: 'artist@example.com',
        password: 'password123',
      },
    })

    await prisma.album.create({
      data: {
        id: ALBUM_ID,
        title: 'Seed Album',
        cover: 'cover.png',
        artistId: ARTIST_ID,
        description: null,
      },
    })
  })

  afterAll(async () => {
    await prisma.album.deleteMany()
    await prisma.artist.deleteMany()
    await prisma.onModuleDestroy()
  })

  it('findAll should read from database', async () => {
    const result = await service.findAll({ page: 1, limit: 10 })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: ALBUM_ID,
      title: 'Seed Album',
      artistId: ARTIST_ID,
    })
  })

  it('findAll should filter title case-insensitively', async () => {
    await prisma.album.create({
      data: {
        title: 'Rock Album',
        cover: 'cover.png',
        artistId: ARTIST_ID,
        description: null,
      },
    })

    const result = await service.findAll({ page: 1, limit: 10, title: 'rock' })

    expect(result.length).toBeGreaterThan(0)
    const [first] = result
    expect(first).toBeDefined()
    expect(first!.title.toLowerCase()).toContain('rock')
  })

  it('getById should return album from database', async () => {
    const result = await service.getById(ALBUM_ID)

    expect(result).toMatchObject({
      id: ALBUM_ID,
      title: 'Seed Album',
    })
  })

  it('create should persist album in database', async () => {
    const created = await service.create(ARTIST_ID, {
      title: 'Created Album',
      description: 'desc',
    })

    expect(created).toMatchObject({
      title: 'Created Album',
      artistId: ARTIST_ID,
    })

    const stored = await prisma.album.findUnique({ where: { id: created.id } })
    expect(stored).not.toBeNull()
    expect(stored?.description).toBe('desc')
  })

  it('create should persist cover and releaseDate', async () => {
    const releaseDate = new Date('2024-02-01T00:00:00.000Z')
    const created = await service.create(ARTIST_ID, {
      title: 'Dated Album',
      description: 'dated',
    })

    await prisma.album.update({
      where: { id: created.id },
      data: { cover: 'cover.png', releaseDate },
    })

    const stored = await prisma.album.findUnique({ where: { id: created.id } })
    expect(stored?.cover).toBe('cover.png')
    expect(stored?.releaseDate?.toISOString()).toBe(releaseDate.toISOString())
  })

  it('update should persist changes in database', async () => {
    const updated = await service.update(ARTIST_ID, ALBUM_ID, {
      title: 'Updated Album',
      description: 'updated desc',
    })

    expect(updated).toMatchObject({
      id: ALBUM_ID,
      title: 'Updated Album',
      description: 'updated desc',
    })

    const stored = await prisma.album.findUnique({ where: { id: ALBUM_ID } })
    expect(stored?.title).toBe('Updated Album')
    expect(stored?.description).toBe('updated desc')
  })

  it('delete should remove album from database', async () => {
    const deleted = await service.delete(ARTIST_ID, ALBUM_ID)

    expect(deleted).toMatchObject({
      id: ALBUM_ID,
      title: 'Seed Album',
    })

    const stored = await prisma.album.findUnique({ where: { id: ALBUM_ID } })
    expect(stored).toBeNull()
  })

  it('update should reject other artist', async () => {
    await expect(
      service.update('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', ALBUM_ID, { title: 'Hack' }),
    ).rejects.toThrow('Album not found or does not belong to the artist')
  })

  it('delete should reject other artist', async () => {
    await expect(service.delete('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', ALBUM_ID)).rejects.toThrow(
      'Album not found or does not belong to the artist',
    )
  })
})
