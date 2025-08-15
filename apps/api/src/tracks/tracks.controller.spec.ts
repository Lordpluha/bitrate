import { Test, TestingModule } from '@nestjs/testing'
import { TracksController } from './tracks.controller'
import { TracksService } from './tracks.service'
import { CreateTrackDto } from './dtos/create-track.dto'
import { AuthGuard } from 'src/auth/auth.guard'
import { UserEntity } from 'src/users/entities'

interface MockRequest {
  user: UserEntity
}

describe('TracksController', () => {
  let controller: TracksController

  const mockTracksService = {
    findAll: jest.fn(),
    findTrackById: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }

  const mockTrack = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Track',
    audioUrl: 'https://example.com/audio.mp3',
    cover: 'https://example.com/cover.jpg',
    artistId: '123e4567-e89b-12d3-a456-426614174001',
    createdAt: new Date('2023-01-01')
  }

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    username: 'testuser',
    email: 'user@example.com'
  } as UserEntity

  const mockRequest: MockRequest = {
    user: mockUser
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TracksController],
      providers: [
        {
          provide: TracksService,
          useValue: mockTracksService
        }
      ]
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile()

    controller = module.get<TracksController>(TracksController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getAll', () => {
    it('should return all tracks with default pagination', async () => {
      const mockResponse = {
        data: [mockTrack],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          lastPage: 1
        }
      }

      mockTracksService.findAll.mockResolvedValue(mockResponse)

      const result = await controller.getAll()

      expect(mockTracksService.findAll).toHaveBeenCalledWith({
        limit: undefined,
        page: undefined,
        title: undefined
      })
      expect(result).toEqual(mockResponse)
    })

    it('should return tracks with custom pagination', async () => {
      const page = 2
      const limit = 5
      const mockResponse = {
        data: [mockTrack],
        meta: {
          total: 15,
          page: 2,
          limit: 5,
          lastPage: 3
        }
      }

      mockTracksService.findAll.mockResolvedValue(mockResponse)

      const result = await controller.getAll(page, limit)

      expect(mockTracksService.findAll).toHaveBeenCalledWith({
        limit,
        page,
        title: undefined
      })
      expect(result).toEqual(mockResponse)
    })

    it('should return tracks filtered by title', async () => {
      const title = 'Test Track'
      const mockResponse = {
        data: [mockTrack],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          lastPage: 1
        }
      }

      mockTracksService.findAll.mockResolvedValue(mockResponse)

      const result = await controller.getAll(undefined, undefined, title)

      expect(mockTracksService.findAll).toHaveBeenCalledWith({
        limit: undefined,
        page: undefined,
        title
      })
      expect(result).toEqual(mockResponse)
    })

    it('should return tracks with all parameters', async () => {
      const page = 1
      const limit = 20
      const title = 'Test'
      const mockResponse = {
        data: [mockTrack],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          lastPage: 1
        }
      }

      mockTracksService.findAll.mockResolvedValue(mockResponse)

      const result = await controller.getAll(page, limit, title)

      expect(mockTracksService.findAll).toHaveBeenCalledWith({
        limit,
        page,
        title
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getById', () => {
    it('should return a track by id', async () => {
      const trackId = mockTrack.id

      mockTracksService.findTrackById.mockResolvedValue(mockTrack)

      const result = await controller.getById(trackId)

      expect(mockTracksService.findTrackById).toHaveBeenCalledWith(trackId)
      expect(result).toEqual(mockTrack)
    })

    it('should handle when track not found', async () => {
      const trackId = 'non-existent-id'

      mockTracksService.findTrackById.mockResolvedValue(null)

      const result = await controller.getById(trackId)

      expect(mockTracksService.findTrackById).toHaveBeenCalledWith(trackId)
      expect(result).toBeNull()
    })
  })

  describe('postTrack', () => {
    it('should create a new track', async () => {
      const createTrackDto: CreateTrackDto = {
        title: 'New Track',
        audioUrl: 'https://example.com/new-audio.mp3',
        cover: 'https://example.com/new-cover.jpg'
      }

      const expectedTrack = {
        ...mockTrack,
        ...createTrackDto,
        artistId: mockUser.id
      }

      mockTracksService.create.mockResolvedValue(expectedTrack)

      const result = await controller.postTrack(
        mockRequest as never,
        createTrackDto
      )

      expect(mockTracksService.create).toHaveBeenCalledWith(
        mockUser.id,
        createTrackDto
      )
      expect(result).toEqual(expectedTrack)
    })

    it('should create a track without cover', async () => {
      const createTrackDto: CreateTrackDto = {
        title: 'New Track',
        audioUrl: 'https://example.com/new-audio.mp3'
      }

      const expectedTrack = {
        ...mockTrack,
        ...createTrackDto,
        cover: null,
        artistId: mockUser.id
      }

      mockTracksService.create.mockResolvedValue(expectedTrack)

      const result = await controller.postTrack(
        mockRequest as never,
        createTrackDto
      )

      expect(mockTracksService.create).toHaveBeenCalledWith(
        mockUser.id,
        createTrackDto
      )
      expect(result).toEqual(expectedTrack)
    })

    it('should handle creation errors', async () => {
      const createTrackDto: CreateTrackDto = {
        title: 'New Track',
        audioUrl: 'https://example.com/new-audio.mp3'
      }
      const error = new Error('Creation failed')

      mockTracksService.create.mockRejectedValue(error)

      await expect(
        controller.postTrack(mockRequest as never, createTrackDto)
      ).rejects.toThrow(error)
      expect(mockTracksService.create).toHaveBeenCalledWith(
        mockUser.id,
        createTrackDto
      )
    })
  })

  describe('putTrack', () => {
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

      mockTracksService.update.mockResolvedValue(expectedTrack)

      const result = await controller.putTrack(trackId, updateTrackDto)

      expect(mockTracksService.update).toHaveBeenCalledWith(
        trackId,
        updateTrackDto
      )
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

      mockTracksService.update.mockResolvedValue(expectedTrack)

      const result = await controller.putTrack(trackId, updateTrackDto)

      expect(mockTracksService.update).toHaveBeenCalledWith(
        trackId,
        updateTrackDto
      )
      expect(result).toEqual(expectedTrack)
    })

    it('should handle update errors', async () => {
      const trackId = 'non-existent-id'
      const updateTrackDto: CreateTrackDto = {
        title: 'Updated Track',
        audioUrl: 'https://example.com/updated-audio.mp3'
      }
      const error = new Error('Update failed')

      mockTracksService.update.mockRejectedValue(error)

      await expect(
        controller.putTrack(trackId, updateTrackDto)
      ).rejects.toThrow(error)
      expect(mockTracksService.update).toHaveBeenCalledWith(
        trackId,
        updateTrackDto
      )
    })
  })
})
