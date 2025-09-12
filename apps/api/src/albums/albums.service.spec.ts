import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../prisma/prisma.service'

import { CreateAlbumDto } from './dtos/create-album.dto'
import { UpdateAlbumDto } from './dtos/update-album.dto'

import { AlbumsService } from './albums.service'
import { AlbumEntity } from './entities'

describe('AlbumsService', () => {
  let service: AlbumsService

  const mockAlbum: AlbumEntity = {
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

  const mockArtist = {
    id: 'artist1',
    username: 'testartist',
    email: 'artist@example.com'
  }

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlbumsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    service = module.get<AlbumsService>(AlbumsService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return albums list with default pagination', async () => {
      const albums = [mockAlbumWithTracks]
      mockPrismaService.album.findMany.mockResolvedValue(albums)

      const result = await service.findAll({})

      expect(mockPrismaService.album.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: undefined,
        include: {
          tracks: true
        }
      })
      expect(result).toEqual(albums)
    })

    it('should return albums list with custom pagination', async () => {
      const albums = [mockAlbumWithTracks]
      mockPrismaService.album.findMany.mockResolvedValue(albums)

      const result = await service.findAll({ page: 2, limit: 5 })

      expect(mockPrismaService.album.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        where: undefined,
        include: {
          tracks: true
        }
      })
      expect(result).toEqual(albums)
    })

    it('should filter albums by title', async () => {
      const albums = [mockAlbumWithTracks]
      mockPrismaService.album.findMany.mockResolvedValue(albums)

      const result = await service.findAll({ title: 'Test' })

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
  })

  describe('getById', () => {
    it('should return album by id with tracks', async () => {
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

    it('should return null when album not found', async () => {
      mockPrismaService.album.findFirst.mockResolvedValue(null)

      const result = await service.getById('999')

      expect(mockPrismaService.album.findFirst).toHaveBeenCalledWith({
        where: { id: '999' },
        include: {
          tracks: true
        }
      })
      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create a new album', async () => {
      const createAlbumDto: CreateAlbumDto = {
        title: 'New Album',
        description: 'New album description'
      }

      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist)
      mockPrismaService.album.create.mockResolvedValue(mockAlbum)

      const result = await service.create('artist1', createAlbumDto)

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

    it('should throw NotFoundException when artist not found', async () => {
      const createAlbumDto: CreateAlbumDto = {
        title: 'New Album',
        description: 'New album description'
      }

      mockPrismaService.artist.findUnique.mockResolvedValue(null)

      await expect(
        service.create('nonexistent', createAlbumDto)
      ).rejects.toThrow(NotFoundException)

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent' }
      })
      expect(mockPrismaService.album.create).not.toHaveBeenCalled()
    })

    it('should handle database errors during creation', async () => {
      const createAlbumDto: CreateAlbumDto = {
        title: 'New Album',
        description: 'New album description'
      }

      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist)
      const error = new Error('Database error')
      mockPrismaService.album.create.mockRejectedValue(error)

      await expect(service.create('artist1', createAlbumDto)).rejects.toThrow(
        error
      )

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
    })
  })

  describe('update', () => {
    it('should update album successfully', async () => {
      const updateAlbumDto: UpdateAlbumDto = {
        title: 'Updated Album',
        description: 'Updated description'
      }

      const updatedAlbum = { ...mockAlbum, ...updateAlbumDto }

      mockPrismaService.album.findFirst.mockResolvedValue(mockAlbum)
      mockPrismaService.album.update.mockResolvedValue(updatedAlbum)

      const result = await service.update('artist1', '1', updateAlbumDto)

      expect(mockPrismaService.album.findFirst).toHaveBeenCalledWith({
        where: { id: '1', artistId: 'artist1' }
      })
      expect(mockPrismaService.album.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateAlbumDto
      })
      expect(result).toEqual(updatedAlbum)
    })

    it('should throw error when album not found or does not belong to artist', async () => {
      const updateAlbumDto: UpdateAlbumDto = {
        title: 'Updated Album',
        description: 'Updated description'
      }

      mockPrismaService.album.findFirst.mockResolvedValue(null)

      await expect(
        service.update('artist1', '999', updateAlbumDto)
      ).rejects.toThrow('Album not found or does not belong to the artist')

      expect(mockPrismaService.album.findFirst).toHaveBeenCalledWith({
        where: { id: '999', artistId: 'artist1' }
      })
      expect(mockPrismaService.album.update).not.toHaveBeenCalled()
    })

    it('should handle update errors', async () => {
      const updateAlbumDto: UpdateAlbumDto = {
        title: 'Updated Album',
        description: 'Updated description'
      }

      const error = new Error('Update failed')

      mockPrismaService.album.findFirst.mockResolvedValue(mockAlbum)
      mockPrismaService.album.update.mockRejectedValue(error)

      await expect(
        service.update('artist1', '1', updateAlbumDto)
      ).rejects.toThrow(error)

      expect(mockPrismaService.album.findFirst).toHaveBeenCalledWith({
        where: { id: '1', artistId: 'artist1' }
      })
      expect(mockPrismaService.album.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateAlbumDto
      })
    })
  })

  describe('delete', () => {
    it('should delete album successfully', async () => {
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

    it('should throw error when album not found or does not belong to artist', async () => {
      mockPrismaService.album.findFirst.mockResolvedValue(null)

      await expect(service.delete('artist1', '999')).rejects.toThrow(
        'Album not found or does not belong to the artist'
      )

      expect(mockPrismaService.album.findFirst).toHaveBeenCalledWith({
        where: { id: '999', artistId: 'artist1' }
      })
      expect(mockPrismaService.album.delete).not.toHaveBeenCalled()
    })

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed')

      mockPrismaService.album.findFirst.mockResolvedValue(mockAlbum)
      mockPrismaService.album.delete.mockRejectedValue(error)

      await expect(service.delete('artist1', '1')).rejects.toThrow(error)

      expect(mockPrismaService.album.findFirst).toHaveBeenCalledWith({
        where: { id: '1', artistId: 'artist1' }
      })
      expect(mockPrismaService.album.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        omit: {
          artistId: true
        }
      })
    })
  })
})
