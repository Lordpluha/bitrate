import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AlbumsModule } from './albums.module'
import { AlbumsService } from './albums.service'
import { CreateAlbumDto } from './dtos/create-album.dto'
import { UpdateAlbumDto } from './dtos/update-album.dto'

describe('Albums Integration Tests', () => {
  let app: INestApplication
  let service: AlbumsService

  const mockPrismaService = {
    album: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    artist: {
      findUnique: jest.fn()
    }
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AlbumsModule]
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile()

    app = module.createNestApplication()
    await app.init()

    service = module.get<AlbumsService>(AlbumsService)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Album CRUD Operations', () => {
    const mockArtist = {
      id: 'artist1',
      username: 'testartist',
      email: 'artist@example.com'
    }

    const mockAlbum = {
      id: '1',
      title: 'Test Album',
      cover: 'album-cover.jpg',
      artistId: 'artist1',
      description: 'Test album description',
      createdAt: new Date()
    }

    const mockAlbumWithTracks = {
      ...mockAlbum,
      tracks: [
        {
          id: '1',
          title: 'Track 1',
          duration: 180,
          albumId: '1',
          artistId: 'artist1'
        }
      ]
    }

    it('should create an album successfully', async () => {
      const createDto: CreateAlbumDto = {
        title: 'New Album',
        description: 'New album description'
      }

      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist)
      mockPrismaService.album.create.mockResolvedValue(mockAlbum)

      const result = await service.create('artist1', createDto)

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: 'artist1' }
      })
      expect(mockPrismaService.album.create).toHaveBeenCalledWith({
        data: {
          artistId: 'artist1',
          title: 'New Album',
          description: 'New album description'
        }
      })
      expect(result).toEqual(mockAlbum)
    })

    it('should find all albums with filtering and pagination', async () => {
      const albums = [mockAlbumWithTracks]
      mockPrismaService.album.findMany.mockResolvedValue(albums)

      const result = await service.findAll({
        page: 1,
        limit: 10,
        title: 'Test'
      })

      expect(mockPrismaService.album.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          title: {
            contains: 'Test',
            mode: 'insensitive'
          }
        },
        include: {
          tracks: true
        }
      })
      expect(result).toEqual(albums)
    })

    it('should get album by id', async () => {
      mockPrismaService.album.findFirst.mockResolvedValue(mockAlbumWithTracks)

      const result = await service.getById('1')

      expect(mockPrismaService.album.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          tracks: true
        }
      })
      expect(result).toEqual(mockAlbumWithTracks)
    })

    it('should update an album', async () => {
      const updateDto: UpdateAlbumDto = {
        title: 'Updated Album',
        description: 'Updated description'
      }
      const updatedAlbum = { ...mockAlbum, ...updateDto }

      mockPrismaService.album.findFirst.mockResolvedValue(mockAlbum)
      mockPrismaService.album.update.mockResolvedValue(updatedAlbum)

      const result = await service.update('artist1', '1', updateDto)

      expect(mockPrismaService.album.findFirst).toHaveBeenCalledWith({
        where: { id: '1', artistId: 'artist1' }
      })
      expect(mockPrismaService.album.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto
      })
      expect(result).toEqual(updatedAlbum)
    })

    it('should delete an album', async () => {
      const deletedAlbum = {
        id: mockAlbum.id,
        title: mockAlbum.title,
        cover: mockAlbum.cover,
        description: mockAlbum.description,
        createdAt: mockAlbum.createdAt
      }

      mockPrismaService.album.findFirst.mockResolvedValue(mockAlbum)
      mockPrismaService.album.delete.mockResolvedValue(deletedAlbum)

      const result = await service.delete('artist1', '1')

      expect(mockPrismaService.album.findFirst).toHaveBeenCalledWith({
        where: { id: '1', artistId: 'artist1' }
      })
      expect(mockPrismaService.album.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        omit: {
          artistId: true
        }
      })
      expect(result).toEqual(deletedAlbum)
    })
  })

  describe('Error handling', () => {
    it('should handle artist not found during creation', async () => {
      const createDto: CreateAlbumDto = {
        title: 'New Album',
        description: 'New album description'
      }

      mockPrismaService.artist.findUnique.mockResolvedValue(null)

      await expect(service.create('nonexistent', createDto)).rejects.toThrow(
        'Artist not found'
      )
    })

    it('should handle album not found during update', async () => {
      const updateDto: UpdateAlbumDto = {
        title: 'Updated Album',
        description: 'Updated description'
      }

      mockPrismaService.album.findFirst.mockResolvedValue(null)

      await expect(
        service.update('artist1', 'nonexistent', updateDto)
      ).rejects.toThrow('Album not found or does not belong to the artist')
    })

    it('should handle album not found during deletion', async () => {
      mockPrismaService.album.findFirst.mockResolvedValue(null)

      await expect(service.delete('artist1', 'nonexistent')).rejects.toThrow(
        'Album not found or does not belong to the artist'
      )
    })
  })
})
