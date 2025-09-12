import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'

import { TokenService } from '../auth/token.service'
import { PrismaService } from '../prisma/prisma.service'

import { ArtistsController } from './artists.controller'
import { ArtistsService } from './artists.service'
import { CreateArtistDto } from './dtos'
import { ArtistEntity } from './entities'

describe('ArtistsController', () => {
  let controller: ArtistsController

  const mockArtist: ArtistEntity = {
    id: '1',
    username: 'testartist',
    email: 'artist@example.com',
    password: 'password123',
    bio: 'Test artist bio',
    avatar: null,
    backgroundImage: null,
    createdAt: new Date()
  }

  const mockArtistWithoutSensitiveData = {
    id: '1',
    username: 'testartist',
    bio: 'Test artist bio',
    avatar: null,
    backgroundImage: null,
    createdAt: new Date()
  }

  const mockArtistsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }

  const mockPrismaService = {
    artist: {
      findUnique: jest.fn()
    },
    session: {
      findFirst: jest.fn()
    }
  }

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn()
  }

  const mockTokenService = {
    verifyToken: jest.fn()
  }

  const mockReflector = {
    getAllAndOverride: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
      providers: [
        {
          provide: ArtistsService,
          useValue: mockArtistsService
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: TokenService,
          useValue: mockTokenService
        },
        {
          provide: Reflector,
          useValue: mockReflector
        }
      ]
    }).compile()

    controller = module.get<ArtistsController>(ArtistsController)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getAll', () => {
    it('should return artists list with default pagination', async () => {
      const artists = [mockArtistWithoutSensitiveData]
      mockArtistsService.findAll.mockResolvedValue(artists)

      const result = await controller.getAll()

      expect(mockArtistsService.findAll).toHaveBeenCalledWith({
        limit: 10,
        page: 1,
        username: undefined
      })
      expect(result).toEqual(artists)
    })

    it('should return artists list with custom pagination', async () => {
      const artists = [mockArtistWithoutSensitiveData]
      mockArtistsService.findAll.mockResolvedValue(artists)

      const result = await controller.getAll(undefined, '2', '5')

      expect(mockArtistsService.findAll).toHaveBeenCalledWith({
        limit: 5,
        page: 2,
        username: undefined
      })
      expect(result).toEqual(artists)
    })

    it('should filter artists by username', async () => {
      const artists = [mockArtistWithoutSensitiveData]
      mockArtistsService.findAll.mockResolvedValue(artists)

      const result = await controller.getAll('test')

      expect(mockArtistsService.findAll).toHaveBeenCalledWith({
        limit: 10,
        page: 1,
        username: 'test'
      })
      expect(result).toEqual(artists)
    })
  })

  describe('getById', () => {
    it('should return artist by id', async () => {
      mockArtistsService.findById.mockResolvedValue(
        mockArtistWithoutSensitiveData
      )

      const result = await controller.getById('1')

      expect(mockArtistsService.findById).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockArtistWithoutSensitiveData)
    })

    it('should handle errors when artist not found', async () => {
      const error = new Error('Artist not found')
      mockArtistsService.findById.mockRejectedValue(error)

      await expect(controller.getById('999')).rejects.toThrow(error)

      expect(mockArtistsService.findById).toHaveBeenCalledWith('999')
    })
  })

  describe('getByUsername', () => {
    it('should return artist by username', async () => {
      mockArtistsService.findByUsername.mockResolvedValue(mockArtist)

      const result = await controller.getByUsername('testartist')

      expect(mockArtistsService.findByUsername).toHaveBeenCalledWith(
        'testartist'
      )
      expect(result).toEqual(mockArtist)
    })

    it('should return null when artist not found', async () => {
      mockArtistsService.findByUsername.mockResolvedValue(null)

      const result = await controller.getByUsername('nonexistent')

      expect(mockArtistsService.findByUsername).toHaveBeenCalledWith(
        'nonexistent'
      )
      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create a new artist', async () => {
      const createArtistDto: CreateArtistDto = {
        username: 'newartist',
        email: 'new@example.com',
        password: 'password123'
      }

      mockArtistsService.create.mockResolvedValue(
        mockArtistWithoutSensitiveData
      )

      const result = await controller.create(createArtistDto)

      expect(mockArtistsService.create).toHaveBeenCalledWith(createArtistDto)
      expect(result).toEqual(mockArtistWithoutSensitiveData)
    })

    it('should handle creation errors', async () => {
      const createArtistDto: CreateArtistDto = {
        username: 'newartist',
        email: 'new@example.com',
        password: 'password123'
      }

      const error = new Error('Creation failed')
      mockArtistsService.create.mockRejectedValue(error)

      await expect(controller.create(createArtistDto)).rejects.toThrow(error)

      expect(mockArtistsService.create).toHaveBeenCalledWith(createArtistDto)
    })
  })

  describe('updateProfile', () => {
    it('should update artist profile', async () => {
      const updateData = { bio: 'Updated bio' }
      const updatedArtist = {
        ...mockArtistWithoutSensitiveData,
        bio: 'Updated bio'
      }

      mockArtistsService.update.mockResolvedValue(updatedArtist)

      const result = await controller.updateProfile('1', updateData)

      expect(mockArtistsService.update).toHaveBeenCalledWith('1', updateData)
      expect(result).toEqual(updatedArtist)
    })

    it('should handle update errors', async () => {
      const updateData = { bio: 'Updated bio' }
      const error = new Error('Update failed')

      mockArtistsService.update.mockRejectedValue(error)

      await expect(controller.updateProfile('1', updateData)).rejects.toThrow(
        error
      )

      expect(mockArtistsService.update).toHaveBeenCalledWith('1', updateData)
    })
  })

  describe('deleteProfile', () => {
    it('should delete artist profile', async () => {
      mockArtistsService.delete.mockResolvedValue(
        mockArtistWithoutSensitiveData
      )

      const result = await controller.deleteProfile('1')

      expect(mockArtistsService.delete).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockArtistWithoutSensitiveData)
    })

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed')
      mockArtistsService.delete.mockRejectedValue(error)

      await expect(controller.deleteProfile('1')).rejects.toThrow(error)

      expect(mockArtistsService.delete).toHaveBeenCalledWith('1')
    })
  })
})
