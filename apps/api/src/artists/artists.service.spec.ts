import { Test, TestingModule } from '@nestjs/testing'
import { ArtistsService } from './artists.service'
import { PrismaService } from '../prisma/prisma.service'
import { ArtistEntity } from './entities'
import { CreateArtistDto } from './dtos'

describe('ArtistsService', () => {
  let service: ArtistsService

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

  const mockPrismaService = {
    artist: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    service = module.get<ArtistsService>(ArtistsService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a new artist', async () => {
      const createArtistDto: CreateArtistDto = {
        username: 'testartist',
        email: 'artist@example.com',
        password: 'password123'
      }

      mockPrismaService.artist.create.mockResolvedValue(
        mockArtistWithoutSensitiveData
      )

      const result = await service.create(createArtistDto)

      expect(mockPrismaService.artist.create).toHaveBeenCalledWith({
        data: {
          password: 'password123',
          username: 'testartist',
          email: 'artist@example.com'
        },
        omit: {
          password: true
        }
      })
      expect(result).toEqual(mockArtistWithoutSensitiveData)
    })

    it('should handle database errors during creation', async () => {
      const createArtistDto: CreateArtistDto = {
        username: 'testartist',
        email: 'artist@example.com',
        password: 'password123'
      }

      const error = new Error('Database error')
      mockPrismaService.artist.create.mockRejectedValue(error)

      await expect(service.create(createArtistDto)).rejects.toThrow(error)

      expect(mockPrismaService.artist.create).toHaveBeenCalledWith({
        data: {
          password: 'password123',
          username: 'testartist',
          email: 'artist@example.com'
        },
        omit: {
          password: true
        }
      })
    })
  })

  describe('findAll', () => {
    it('should return artists list with default pagination', async () => {
      const artists = [mockArtistWithoutSensitiveData]
      mockPrismaService.artist.findMany.mockResolvedValue(artists)

      const result = await service.findAll({})

      expect(mockPrismaService.artist.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: undefined,
        omit: {
          password: true,
          email: true
        }
      })
      expect(result).toEqual(artists)
    })

    it('should return artists list with custom pagination', async () => {
      const artists = [mockArtistWithoutSensitiveData]
      mockPrismaService.artist.findMany.mockResolvedValue(artists)

      const result = await service.findAll({ page: 2, limit: 5 })

      expect(mockPrismaService.artist.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        where: undefined,
        omit: {
          password: true,
          email: true
        }
      })
      expect(result).toEqual(artists)
    })

    it('should filter artists by username', async () => {
      const artists = [mockArtistWithoutSensitiveData]
      mockPrismaService.artist.findMany.mockResolvedValue(artists)

      const result = await service.findAll({ username: 'test' })

      expect(mockPrismaService.artist.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          username: {
            contains: 'test',
            mode: 'insensitive'
          }
        },
        omit: {
          password: true,
          email: true
        }
      })
      expect(result).toEqual(artists)
    })
  })

  describe('findByUsername', () => {
    it('should return artist by username', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist)

      const result = await service.findByUsername('testartist')

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { username: 'testartist' }
      })
      expect(result).toEqual(mockArtist)
    })

    it('should return null when artist not found', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(null)

      const result = await service.findByUsername('nonexistent')

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { username: 'nonexistent' }
      })
      expect(result).toBeNull()
    })
  })

  describe('findByEmail', () => {
    it('should return artist by email', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist)

      const result = await service.findByEmail('artist@example.com')

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { email: 'artist@example.com' }
      })
      expect(result).toEqual(mockArtist)
    })

    it('should return null when artist not found', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(null)

      const result = await service.findByEmail('nonexistent@example.com')

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' }
      })
      expect(result).toBeNull()
    })
  })

  describe('findById', () => {
    it('should return artist by id without sensitive data', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(
        mockArtistWithoutSensitiveData
      )

      const result = await service.findById('1')

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        omit: {
          password: true,
          email: true
        }
      })
      expect(result).toEqual(mockArtistWithoutSensitiveData)
    })

    it('should return null when artist not found', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(null)

      const result = await service.findById('999')

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
        omit: {
          password: true,
          email: true
        }
      })
      expect(result).toBeNull()
    })
  })

  describe('findById_UNSECURE', () => {
    it('should return artist by id with all data', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist)

      const result = await service.findById_UNSECURE('1')

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      })
      expect(result).toEqual(mockArtist)
    })
  })

  describe('update', () => {
    it('should update artist successfully', async () => {
      const updateData = { bio: 'Updated bio' }
      const updatedArtist = {
        ...mockArtistWithoutSensitiveData,
        bio: 'Updated bio'
      }

      mockPrismaService.artist.update.mockResolvedValue(updatedArtist)

      const result = await service.update('1', updateData)

      expect(mockPrismaService.artist.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
        omit: {
          password: true
        }
      })
      expect(result).toEqual(updatedArtist)
    })

    it('should handle update errors', async () => {
      const updateData = { bio: 'Updated bio' }
      const error = new Error('Update failed')

      mockPrismaService.artist.update.mockRejectedValue(error)

      await expect(service.update('1', updateData)).rejects.toThrow(error)

      expect(mockPrismaService.artist.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
        omit: {
          password: true
        }
      })
    })
  })

  describe('delete', () => {
    it('should delete artist successfully', async () => {
      mockPrismaService.artist.delete.mockResolvedValue(
        mockArtistWithoutSensitiveData
      )

      const result = await service.delete('1')

      expect(mockPrismaService.artist.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        omit: {
          password: true
        }
      })
      expect(result).toEqual(mockArtistWithoutSensitiveData)
    })

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed')
      mockPrismaService.artist.delete.mockRejectedValue(error)

      await expect(service.delete('1')).rejects.toThrow(error)

      expect(mockPrismaService.artist.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        omit: {
          password: true
        }
      })
    })
  })
})
