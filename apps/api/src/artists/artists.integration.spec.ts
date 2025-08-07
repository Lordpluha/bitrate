import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ArtistsModule } from './artists.module'
import { ArtistsService } from './artists.service'
import { CreateArtistDto } from './dtos'

describe('Artists Integration Tests', () => {
  let app: INestApplication
  let service: ArtistsService

  const mockPrismaService = {
    artist: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ArtistsModule]
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile()

    app = module.createNestApplication()
    await app.init()

    service = module.get<ArtistsService>(ArtistsService)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Artist CRUD Operations', () => {
    const mockArtist = {
      id: '1',
      username: 'testartist',
      email: 'artist@example.com',
      password: 'hashedPassword',
      bio: 'Test artist biography',
      avatar: null,
      backgroundImage: null,
      createdAt: new Date()
    }

    const mockArtistWithoutSensitiveData = {
      id: '1',
      username: 'testartist',
      bio: 'Test artist biography',
      avatar: null,
      backgroundImage: null,
      createdAt: new Date()
    }

    it('should create an artist successfully', async () => {
      const createDto: CreateArtistDto = {
        username: 'newartist',
        email: 'new@example.com',
        password: 'password123'
      }

      mockPrismaService.artist.create.mockResolvedValue(
        mockArtistWithoutSensitiveData
      )

      const result = await service.create(createDto)

      expect(mockPrismaService.artist.create).toHaveBeenCalledWith({
        data: {
          password: 'password123',
          username: 'newartist',
          email: 'new@example.com'
        },
        omit: {
          password: true
        }
      })
      expect(result).toEqual(mockArtistWithoutSensitiveData)
    })

    it('should find all artists with filtering and pagination', async () => {
      const artists = [mockArtistWithoutSensitiveData]
      mockPrismaService.artist.findMany.mockResolvedValue(artists)

      const result = await service.findAll({
        page: 1,
        limit: 10,
        username: 'test'
      })

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

    it('should find artist by id (secure)', async () => {
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

    it('should find artist by id (unsecure)', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist)

      const result = await service.findById_UNSECURE('1')

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      })
      expect(result).toEqual(mockArtist)
    })

    it('should find artist by username', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist)

      const result = await service.findByUsername('testartist')

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { username: 'testartist' }
      })
      expect(result).toEqual(mockArtist)
    })

    it('should find artist by email', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist)

      const result = await service.findByEmail('artist@example.com')

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { email: 'artist@example.com' }
      })
      expect(result).toEqual(mockArtist)
    })

    it('should update an artist', async () => {
      const updateData = { bio: 'Updated biography' }
      const updatedArtist = {
        ...mockArtistWithoutSensitiveData,
        bio: 'Updated biography'
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

    it('should delete an artist', async () => {
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
  })

  describe('Error handling', () => {
    it('should handle creation errors', async () => {
      const createDto: CreateArtistDto = {
        username: 'newartist',
        email: 'new@example.com',
        password: 'password123'
      }

      const error = new Error('Database constraint violation')
      mockPrismaService.artist.create.mockRejectedValue(error)

      await expect(service.create(createDto)).rejects.toThrow(error)
    })

    it('should handle update errors', async () => {
      const updateData = { bio: 'Updated biography' }
      const error = new Error('Artist not found')

      mockPrismaService.artist.update.mockRejectedValue(error)

      await expect(service.update('nonexistent', updateData)).rejects.toThrow(
        error
      )
    })

    it('should handle delete errors', async () => {
      const error = new Error('Artist not found')
      mockPrismaService.artist.delete.mockRejectedValue(error)

      await expect(service.delete('nonexistent')).rejects.toThrow(error)
    })

    it('should return null when artist not found by username', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(null)

      const result = await service.findByUsername('nonexistent')

      expect(result).toBeNull()
    })

    it('should return null when artist not found by email', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(null)

      const result = await service.findByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })

    it('should return null when artist not found by id', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(null)

      const result = await service.findById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('Data Security', () => {
    it('should omit sensitive data in findAll', async () => {
      const artists = [
        {
          id: '1',
          username: 'testartist',
          bio: 'Test bio',
          avatar: null,
          backgroundImage: null,
          createdAt: new Date()
          // No password or email
        }
      ]
      mockPrismaService.artist.findMany.mockResolvedValue(artists)

      const result = await service.findAll({})

      expect(mockPrismaService.artist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          omit: {
            password: true,
            email: true
          }
        })
      )
      expect(result).toEqual(artists)
    })

    it('should omit sensitive data in findById', async () => {
      const artist = {
        id: '1',
        username: 'testartist',
        bio: 'Test bio',
        avatar: null,
        backgroundImage: null,
        createdAt: new Date()
        // No password or email
      }
      mockPrismaService.artist.findUnique.mockResolvedValue(artist)

      const result = await service.findById('1')

      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          omit: {
            password: true,
            email: true
          }
        })
      )
      expect(result).toEqual(artist)
    })

    it('should omit password in create', async () => {
      const createDto: CreateArtistDto = {
        username: 'newartist',
        email: 'new@example.com',
        password: 'password123'
      }

      const createdArtist = {
        id: '1',
        username: 'newartist',
        bio: null,
        avatar: null,
        backgroundImage: null,
        createdAt: new Date()
        // No password
      }

      mockPrismaService.artist.create.mockResolvedValue(createdArtist)

      await service.create(createDto)

      expect(mockPrismaService.artist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          omit: {
            password: true
          }
        })
      )
    })
  })
})
