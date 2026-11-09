import { beforeEach, describe, expect, it } from '@jest/globals'
import { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildAdminGenre } from './__tests__/fixtures/admin-genres.fixtures'
import { AdminGenresService } from './admin-genres.service'
import { GenreInUseException, GenreNotFoundException, GenreSlugTakenException } from './errors'

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
    meta: { target: ['slug'] },
  })

describe('AdminGenresService', () => {
  let service: AdminGenresService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new AdminGenresService(prisma)
  })

  describe('findAll', () => {
    it('returns a page with reference counts, id tie-break and name search', async () => {
      prisma.genre.findMany.mockResolvedValue([buildAdminGenre({ tracks: 3, albums: 1 })] as never)
      prisma.genre.count.mockResolvedValue(1)

      const result = await service.findAll({
        page: 2,
        limit: 5,
        q: 'syn',
        sort: 'name',
        order: 'asc',
      })

      expect(result.total).toBe(1)
      expect(result.page).toBe(2)
      expect(result.data[0]?.counts).toEqual({ tracks: 3, albums: 1, artists: 0 })
      const call = prisma.genre.findMany.mock.calls[0]?.[0]
      expect(call?.skip).toBe(5)
      expect(call?.take).toBe(5)
      expect(call?.orderBy).toEqual([{ name: 'asc' }, { id: 'asc' }])
      expect(call?.where).toMatchObject({ OR: expect.any(Array) })
    })

    it('defaults to name ascending', async () => {
      prisma.genre.findMany.mockResolvedValue([] as never)
      prisma.genre.count.mockResolvedValue(0)

      await service.findAll({})

      expect(prisma.genre.findMany.mock.calls[0]?.[0]?.orderBy).toEqual([
        { name: 'asc' },
        { id: 'asc' },
      ])
    })
  })

  describe('findById', () => {
    it('returns the genre with counts', async () => {
      prisma.genre.findUnique.mockResolvedValue(buildAdminGenre({ artists: 2 }) as never)

      const result = await service.findById('genre-1')

      expect(result.counts).toEqual({ tracks: 0, albums: 0, artists: 2 })
      expect(result).not.toHaveProperty('_count')
    })

    it('throws GenreNotFoundException for an unknown id', async () => {
      prisma.genre.findUnique.mockResolvedValue(null)

      await expect(service.findById('nope')).rejects.toBeInstanceOf(GenreNotFoundException)
    })
  })

  describe('create', () => {
    it('derives the slug from the name when absent', async () => {
      prisma.genre.create.mockResolvedValue(buildAdminGenre() as never)

      await service.create({ name: ' Drum & Bass  Ünited ' })

      expect(prisma.genre.create.mock.calls[0]?.[0]?.data).toMatchObject({
        name: 'Drum & Bass  Ünited',
        slug: 'drum-bass-united',
      })
    })

    it('keeps an explicit slug, description and colour', async () => {
      prisma.genre.create.mockResolvedValue(buildAdminGenre() as never)

      await service.create({
        name: 'Pop',
        slug: 'pop-music',
        description: 'Hits',
        color: '#112233',
      })

      expect(prisma.genre.create.mock.calls[0]?.[0]?.data).toMatchObject({
        slug: 'pop-music',
        description: 'Hits',
        color: '#112233',
      })
    })

    it('rejects a name that has no sluggable characters', async () => {
      await expect(service.create({ name: '!!!' })).rejects.toThrow()
      expect(prisma.genre.create).not.toHaveBeenCalled()
    })

    it('maps a slug unique violation to GenreSlugTakenException (409)', async () => {
      prisma.genre.create.mockRejectedValue(uniqueViolation())

      await expect(service.create({ name: 'Pop', slug: 'pop' })).rejects.toBeInstanceOf(
        GenreSlugTakenException,
      )
    })
  })

  describe('update', () => {
    it('updates only the given fields', async () => {
      prisma.genre.findUnique.mockResolvedValue(buildAdminGenre() as never)
      prisma.genre.update.mockResolvedValue(buildAdminGenre({ color: null }) as never)

      await service.update('genre-1', { color: null })

      expect(prisma.genre.update.mock.calls[0]?.[0]?.data).toEqual({ color: null })
    })

    it('throws GenreNotFoundException when the genre is missing', async () => {
      prisma.genre.findUnique.mockResolvedValue(null)

      await expect(service.update('nope', { name: 'X' })).rejects.toBeInstanceOf(
        GenreNotFoundException,
      )
    })

    it('maps a slug unique violation to GenreSlugTakenException (409)', async () => {
      prisma.genre.findUnique.mockResolvedValue(buildAdminGenre() as never)
      prisma.genre.update.mockRejectedValue(uniqueViolation())

      await expect(service.update('genre-1', { slug: 'taken' })).rejects.toBeInstanceOf(
        GenreSlugTakenException,
      )
    })
  })

  describe('remove', () => {
    it('refuses with 409 and the counts while the genre is referenced', async () => {
      prisma.genre.findUnique.mockResolvedValue(
        buildAdminGenre({ tracks: 4, albums: 0, artists: 1 }) as never,
      )

      const error = await service.remove('genre-1').catch((caught: unknown) => caught)

      expect(error).toBeInstanceOf(GenreInUseException)
      expect((error as GenreInUseException).getStatus()).toBe(409)
      expect((error as GenreInUseException).getResponse()).toMatchObject({
        counts: { tracks: 4, albums: 0, artists: 1 },
      })
      expect(prisma.genre.delete).not.toHaveBeenCalled()
    })

    it('deletes an unreferenced genre physically', async () => {
      prisma.genre.findUnique.mockResolvedValue(buildAdminGenre() as never)
      prisma.genre.delete.mockResolvedValue(buildAdminGenre() as never)

      await service.remove('genre-1')

      expect(prisma.genre.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'genre-1' } }),
      )
    })

    it('throws GenreNotFoundException when the genre is missing', async () => {
      prisma.genre.findUnique.mockResolvedValue(null)

      await expect(service.remove('nope')).rejects.toBeInstanceOf(GenreNotFoundException)
    })
  })
})
