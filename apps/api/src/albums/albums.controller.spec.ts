import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthGuard } from '../auth/auth.guard'
import { TokenService } from '../auth/token.service'
import { PrismaService } from '../prisma/prisma.service'
import { UserEntity } from '../users/entities'

import { CreateAlbumDto } from './dtos/create-album.dto'
import { UpdateAlbumDto } from './dtos/update-album.dto'

import { AlbumsController } from './albums.controller'
import { AlbumsService } from './albums.service'
import { AlbumEntity } from './entities'

interface MockRequest extends Partial<Request> {
  user: UserEntity
}

describe('AlbumsController', () => {
  let controller: AlbumsController

  const mockUser: UserEntity = {
    id: 'user1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    avatar: null,
    description: null,
    createdAt: new Date()
  }

  const mockAlbum: AlbumEntity = {
    id: '1',
    title: 'Test Album',
    cover: 'album-cover.jpg',
    artistId: 'user1',
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
        artistId: 'user1'
      }
    ]
  }

  const mockAlbumsService = {
    findAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn()
  }

  const mockReflector = {
    get: jest.fn(),
    getAll: jest.fn(),
    getAllAndMerge: jest.fn(),
    getAllAndOverride: jest.fn()
  }

  const mockPrismaService = {
    user: {
      findUnique: jest.fn()
    },
    session: {
      findFirst: jest.fn()
    }
  }

  const mockTokenService = {
    verifyToken: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumsController],
      providers: [
        {
          provide: AlbumsService,
          useValue: mockAlbumsService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: Reflector,
          useValue: mockReflector
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: TokenService,
          useValue: mockTokenService
        }
      ]
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile()

    controller = module.get<AlbumsController>(AlbumsController)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getAllAlbums', () => {
    it('should return all albums with default pagination', async () => {
      const albums = [mockAlbumWithTracks]
      mockAlbumsService.findAll.mockResolvedValue(albums)

      const result = await controller.getAllAlbums()

      expect(mockAlbumsService.findAll).toHaveBeenCalledWith({
        limit: NaN,
        page: NaN,
        title: undefined
      })
      expect(result).toEqual(albums)
    })

    it('should return albums with custom pagination and filters', async () => {
      const albums = [mockAlbumWithTracks]
      mockAlbumsService.findAll.mockResolvedValue(albums)

      const result = await controller.getAllAlbums('2', '5', 'Test')

      expect(mockAlbumsService.findAll).toHaveBeenCalledWith({
        limit: 5,
        page: 2,
        title: 'Test'
      })
      expect(result).toEqual(albums)
    })

    it('should handle service errors', async () => {
      const error = new Error('Service error')
      mockAlbumsService.findAll.mockRejectedValue(error)

      await expect(controller.getAllAlbums()).rejects.toThrow(error)
    })
  })

  describe('getById', () => {
    it('should return album by id', async () => {
      mockAlbumsService.getById.mockResolvedValue(mockAlbumWithTracks)

      const result = await controller.getById('1')

      expect(mockAlbumsService.getById).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockAlbumWithTracks)
    })

    it('should return null when album not found', async () => {
      mockAlbumsService.getById.mockResolvedValue(null)

      const result = await controller.getById('999')

      expect(mockAlbumsService.getById).toHaveBeenCalledWith('999')
      expect(result).toBeNull()
    })
  })

  describe('createAlbum', () => {
    it('should create a new album', async () => {
      const createDto: CreateAlbumDto = {
        title: 'New Album',
        description: 'New album description'
      }

      const mockRequest: MockRequest = {
        user: mockUser
      }

      mockAlbumsService.create.mockResolvedValue(mockAlbum)

      const result = await controller.createAlbum(
        mockRequest as Request,
        createDto
      )

      expect(mockAlbumsService.create).toHaveBeenCalledWith('user1', createDto)
      expect(result).toEqual(mockAlbum)
    })

    it('should handle service errors during creation', async () => {
      const createDto: CreateAlbumDto = {
        title: 'New Album',
        description: 'New album description'
      }

      const mockRequest: MockRequest = {
        user: mockUser
      }

      const error = new Error('Creation failed')
      mockAlbumsService.create.mockRejectedValue(error)

      await expect(
        controller.createAlbum(mockRequest as Request, createDto)
      ).rejects.toThrow(error)
    })
  })

  describe('updateAlbum', () => {
    it('should update album successfully', async () => {
      const updateDto: UpdateAlbumDto = {
        title: 'Updated Album',
        description: 'Updated description'
      }

      const mockRequest: MockRequest = {
        user: mockUser
      }

      const updatedAlbum = { ...mockAlbum, ...updateDto }
      mockAlbumsService.update.mockResolvedValue(updatedAlbum)

      const result = await controller.updateAlbum(
        mockRequest as Request,
        '1',
        updateDto
      )

      expect(mockAlbumsService.update).toHaveBeenCalledWith(
        'user1',
        '1',
        updateDto
      )
      expect(result).toEqual(updatedAlbum)
    })

    it('should handle service errors during update', async () => {
      const updateDto: UpdateAlbumDto = {
        title: 'Updated Album',
        description: 'Updated description'
      }

      const mockRequest: MockRequest = {
        user: mockUser
      }

      const error = new Error('Update failed')
      mockAlbumsService.update.mockRejectedValue(error)

      await expect(
        controller.updateAlbum(mockRequest as Request, '1', updateDto)
      ).rejects.toThrow(error)
    })
  })

  describe('deleteAlbum', () => {
    it('should delete album successfully', async () => {
      const mockRequest: MockRequest = {
        user: mockUser
      }

      const deletedAlbum = {
        id: mockAlbum.id,
        title: mockAlbum.title,
        cover: mockAlbum.cover,
        description: mockAlbum.description,
        createdAt: mockAlbum.createdAt
      }

      mockAlbumsService.delete.mockResolvedValue(deletedAlbum)

      const result = await controller.deleteAlbum(mockRequest as Request, '1')

      expect(mockAlbumsService.delete).toHaveBeenCalledWith('user1', '1')
      expect(result).toEqual(deletedAlbum)
    })

    it('should handle service errors during deletion', async () => {
      const mockRequest: MockRequest = {
        user: mockUser
      }

      const error = new Error('Delete failed')
      mockAlbumsService.delete.mockRejectedValue(error)

      await expect(
        controller.deleteAlbum(mockRequest as Request, '1')
      ).rejects.toThrow(error)
    })
  })
})
