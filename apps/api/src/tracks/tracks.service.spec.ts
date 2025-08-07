import { Test, TestingModule } from '@nestjs/testing'
import { TracksService } from './tracks.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateTrackDto } from './dtos/create-track.dto'

describe('TracksService', () => {
  let service: TracksService

  const mockPrismaService = {
    track: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    },
    $transaction: jest.fn()
  }

  const mockTrack = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Track',
    audioUrl: 'https://example.com/audio.mp3',
    cover: 'https://example.com/cover.jpg',
    artistId: '123e4567-e89b-12d3-a456-426614174001',
    createdAt: new Date('2023-01-01')
  }

  const mockArtist = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    username: 'testartist',
    email: 'artist@example.com'
  }

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    username: 'testuser',
    email: 'user@example.com'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    service = module.get<TracksService>(TracksService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return paginated tracks with default pagination', async () => {
      const mockTracks = [mockTrack]
      const mockTotal = 1

      mockPrismaService.$transaction.mockResolvedValue([mockTracks, mockTotal])

      const result = await service.findAll({})

      expect(mockPrismaService.$transaction).toHaveBeenCalledWith([
        mockPrismaService.track.findMany({
          skip: 0,
          where: undefined,
          take: 10
        }),
        mockPrismaService.track.count()
      ])

      expect(result).toEqual({
        data: mockTracks,
        meta: {
          total: mockTotal,
          page: 1,
          limit: 10,
          lastPage: 1
        }
      })
    })

    it('should return paginated tracks with custom pagination', async () => {
      const page = 2
      const limit = 5
      const mockTracks = [mockTrack]
      const mockTotal = 15

      mockPrismaService.$transaction.mockResolvedValue([mockTracks, mockTotal])

      const result = await service.findAll({ page, limit })

      expect(mockPrismaService.$transaction).toHaveBeenCalledWith([
        mockPrismaService.track.findMany({
          skip: 5, // (page - 1) * limit = (2 - 1) * 5
          where: undefined,
          take: 5
        }),
        mockPrismaService.track.count()
      ])

      expect(result).toEqual({
        data: mockTracks,
        meta: {
          total: mockTotal,
          page: 2,
          limit: 5,
          lastPage: 3 // Math.ceil(15 / 5)
        }
      })
    })

    it('should return tracks filtered by title', async () => {
      const title = 'Test'
      const mockTracks = [mockTrack]
      const mockTotal = 1

      mockPrismaService.$transaction.mockResolvedValue([mockTracks, mockTotal])

      const result = await service.findAll({ title })

      expect(mockPrismaService.$transaction).toHaveBeenCalledWith([
        mockPrismaService.track.findMany({
          skip: 0,
          where: {
            title: {
              contains: title,
              mode: 'insensitive'
            }
          },
          take: 10
        }),
        mockPrismaService.track.count()
      ])

      expect(result.data).toEqual(mockTracks)
    })
  })

  describe('findLikedTracksByUserId', () => {
    it('should return liked tracks for a user', async () => {
      const userId = mockUser.id
      const mockLikedTracks = [mockTrack]

      mockPrismaService.track.findMany.mockResolvedValue(mockLikedTracks)

      const result = await service.findLikedTracksByUserId(userId)

      expect(mockPrismaService.track.findMany).toHaveBeenCalledWith({
        where: {
          likedBy: {
            some: {
              id: userId
            }
          }
        }
      })
      expect(result).toEqual(mockLikedTracks)
    })

    it('should return empty array when user has no liked tracks', async () => {
      const userId = mockUser.id

      mockPrismaService.track.findMany.mockResolvedValue([])

      const result = await service.findLikedTracksByUserId(userId)

      expect(result).toEqual([])
    })
  })

  describe('findTrackById', () => {
    it('should return a track by id', async () => {
      const trackId = mockTrack.id

      mockPrismaService.track.findUnique.mockResolvedValue(mockTrack)

      const result = await service.findTrackById(trackId)

      expect(mockPrismaService.track.findUnique).toHaveBeenCalledWith({
        where: {
          id: trackId
        }
      })
      expect(result).toEqual(mockTrack)
    })

    it('should return null when track not found', async () => {
      const trackId = 'non-existent-id'

      mockPrismaService.track.findUnique.mockResolvedValue(null)

      const result = await service.findTrackById(trackId)

      expect(result).toBeNull()
    })
  })

  describe('findTracksByArtistId', () => {
    it('should return tracks by artist id', async () => {
      const artistId = mockArtist.id
      const mockTracks = [mockTrack]

      mockPrismaService.track.findMany.mockResolvedValue(mockTracks)

      const result = await service.findTracksByArtistId(artistId)

      expect(mockPrismaService.track.findMany).toHaveBeenCalledWith({
        where: {
          artistId
        }
      })
      expect(result).toEqual(mockTracks)
    })

    it('should return empty array when artist has no tracks', async () => {
      const artistId = mockArtist.id

      mockPrismaService.track.findMany.mockResolvedValue([])

      const result = await service.findTracksByArtistId(artistId)

      expect(result).toEqual([])
    })
  })

  describe('findTracksByArtistName', () => {
    it('should return tracks by artist username', async () => {
      const artistUsername = mockArtist.username
      const mockTracks = [mockTrack]

      mockPrismaService.track.findMany.mockResolvedValue(mockTracks)

      const result = await service.findTracksByArtistName(artistUsername)

      expect(mockPrismaService.track.findMany).toHaveBeenCalledWith({
        where: {
          artist: {
            username: artistUsername
          }
        }
      })
      expect(result).toEqual(mockTracks)
    })
  })

  describe('create', () => {
    it('should create a new track', async () => {
      const createTrackDto: CreateTrackDto = {
        title: 'New Track',
        audioUrl: 'https://example.com/new-audio.mp3',
        cover: 'https://example.com/new-cover.jpg'
      }
      const artistId = mockArtist.id

      const expectedTrack = {
        ...mockTrack,
        ...createTrackDto,
        artistId
      }

      mockPrismaService.track.create.mockResolvedValue(expectedTrack)

      const result = await service.create(artistId, createTrackDto)

      expect(mockPrismaService.track.create).toHaveBeenCalledWith({
        data: {
          artistId,
          ...createTrackDto
        }
      })
      expect(result).toEqual(expectedTrack)
    })

    it('should create a track without cover', async () => {
      const createTrackDto: CreateTrackDto = {
        title: 'New Track',
        audioUrl: 'https://example.com/new-audio.mp3'
      }
      const artistId = mockArtist.id

      const expectedTrack = {
        ...mockTrack,
        ...createTrackDto,
        cover: null,
        artistId
      }

      mockPrismaService.track.create.mockResolvedValue(expectedTrack)

      const result = await service.create(artistId, createTrackDto)

      expect(mockPrismaService.track.create).toHaveBeenCalledWith({
        data: {
          artistId,
          ...createTrackDto
        }
      })
      expect(result).toEqual(expectedTrack)
    })
  })

  describe('update', () => {
    it('should update a track', async () => {
      const trackId = mockTrack.id
      const updateTrackDto: CreateTrackDto = {
        title: 'Updated Track',
        audioUrl: 'https://example.com/updated-audio.mp3',
        cover: 'https://example.com/updated-cover.jpg'
      }

      const expectedTrack = {
        ...mockTrack,
        ...updateTrackDto
      }

      mockPrismaService.track.update.mockResolvedValue(expectedTrack)

      const result = await service.update(trackId, updateTrackDto)

      expect(mockPrismaService.track.update).toHaveBeenCalledWith({
        where: {
          id: trackId
        },
        data: updateTrackDto
      })
      expect(result).toEqual(expectedTrack)
    })

    it('should update only provided fields', async () => {
      const trackId = mockTrack.id
      const updateTrackDto: CreateTrackDto = {
        title: 'Updated Title',
        audioUrl: mockTrack.audioUrl
      }

      const expectedTrack = {
        ...mockTrack,
        title: updateTrackDto.title
      }

      mockPrismaService.track.update.mockResolvedValue(expectedTrack)

      const result = await service.update(trackId, updateTrackDto)

      expect(mockPrismaService.track.update).toHaveBeenCalledWith({
        where: {
          id: trackId
        },
        data: updateTrackDto
      })
      expect(result).toEqual(expectedTrack)
    })
  })
})
