import { Test, TestingModule } from '@nestjs/testing'
import { PlaylistsService } from './playlists.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreatePlaylistDto } from './dtos/create-playlist.dto'
import { UpdatePlaylistDto } from './dtos/update-playlist.dto'

describe('PlaylistsService', () => {
  let service: PlaylistsService

  const mockPrismaService = {
    playlist: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }

  const mockPlaylist = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Playlist',
    cover: '',
    description: 'Test description',
    createdAt: new Date('2023-01-01'),
    userId: '123e4567-e89b-12d3-a456-426614174001'
  }

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    username: 'testuser'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    service = module.get<PlaylistsService>(PlaylistsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a new playlist', async () => {
      const createPlaylistDto: CreatePlaylistDto = {
        title: 'New Playlist',
        description: 'New description'
      }
      const userId = mockUser.id

      mockPrismaService.playlist.create.mockResolvedValue({
        ...mockPlaylist,
        ...createPlaylistDto,
        userId
      })

      const result = await service.create(userId, createPlaylistDto)

      expect(mockPrismaService.playlist.create).toHaveBeenCalledWith({
        data: {
          userId,
          cover: '',
          ...createPlaylistDto
        }
      })
      expect(result).toEqual({
        ...mockPlaylist,
        ...createPlaylistDto,
        userId
      })
    })

    it('should create a playlist with empty description when not provided', async () => {
      const createPlaylistDto: CreatePlaylistDto = {
        title: 'New Playlist'
      }
      const userId = mockUser.id

      mockPrismaService.playlist.create.mockResolvedValue({
        ...mockPlaylist,
        title: createPlaylistDto.title,
        description: null,
        userId
      })

      await service.create(userId, createPlaylistDto)

      expect(mockPrismaService.playlist.create).toHaveBeenCalledWith({
        data: {
          userId,
          cover: '',
          title: createPlaylistDto.title
        }
      })
    })
  })

  describe('getAll', () => {
    it('should return all playlists with default pagination', async () => {
      const mockPlaylists = [
        { ...mockPlaylist, user: mockUser },
        {
          ...mockPlaylist,
          id: 'another-id',
          title: 'Another Playlist',
          user: mockUser
        }
      ]

      mockPrismaService.playlist.findMany.mockResolvedValue(mockPlaylists)

      const result = await service.getAll({})

      expect(mockPrismaService.playlist.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          }
        }
      })
      expect(result).toEqual(mockPlaylists)
    })

    it('should return playlists with custom pagination', async () => {
      const page = 2
      const limit = 5
      const mockPlaylists = [{ ...mockPlaylist, user: mockUser }]

      mockPrismaService.playlist.findMany.mockResolvedValue(mockPlaylists)

      const result = await service.getAll({ page, limit })

      expect(mockPrismaService.playlist.findMany).toHaveBeenCalledWith({
        skip: 5, // (page - 1) * limit = (2 - 1) * 5
        take: 5,
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          }
        }
      })
      expect(result).toEqual(mockPlaylists)
    })
  })

  describe('getById', () => {
    it('should return a playlist by id', async () => {
      const playlistId = mockPlaylist.id

      mockPrismaService.playlist.findUniqueOrThrow.mockResolvedValue(
        mockPlaylist
      )

      const result = await service.getById(playlistId)

      expect(mockPrismaService.playlist.findUniqueOrThrow).toHaveBeenCalledWith(
        {
          where: {
            id: playlistId
          }
        }
      )
      expect(result).toEqual(mockPlaylist)
    })

    it('should throw error when playlist not found', async () => {
      const playlistId = 'non-existent-id'
      const error = new Error('Record not found')

      mockPrismaService.playlist.findUniqueOrThrow.mockRejectedValue(error)

      await expect(service.getById(playlistId)).rejects.toThrow(error)
      expect(mockPrismaService.playlist.findUniqueOrThrow).toHaveBeenCalledWith(
        {
          where: {
            id: playlistId
          }
        }
      )
    })
  })

  describe('update', () => {
    it('should update a playlist', async () => {
      const updatePlaylistDto: UpdatePlaylistDto = {
        title: 'Updated Playlist',
        description: 'Updated description'
      }
      const userId = mockUser.id
      const playlistId = mockPlaylist.id

      const updatedPlaylist = {
        ...mockPlaylist,
        ...updatePlaylistDto
      }

      mockPrismaService.playlist.update.mockResolvedValue(updatedPlaylist)

      const result = await service.update(userId, playlistId, updatePlaylistDto)

      expect(mockPrismaService.playlist.update).toHaveBeenCalledWith({
        where: {
          id: playlistId
        },
        data: {
          ...updatePlaylistDto,
          userId
        }
      })
      expect(result).toEqual(updatedPlaylist)
    })

    it('should update only title when description is not provided', async () => {
      const updatePlaylistDto: UpdatePlaylistDto = {
        title: 'Updated Title'
      }
      const userId = mockUser.id
      const playlistId = mockPlaylist.id

      const updatedPlaylist = {
        ...mockPlaylist,
        title: updatePlaylistDto.title
      }

      mockPrismaService.playlist.update.mockResolvedValue(updatedPlaylist)

      await service.update(userId, playlistId, updatePlaylistDto)

      expect(mockPrismaService.playlist.update).toHaveBeenCalledWith({
        where: {
          id: playlistId
        },
        data: {
          title: updatePlaylistDto.title,
          userId
        }
      })
    })
  })

  describe('delete', () => {
    it('should delete a playlist', async () => {
      const userId = mockUser.id
      const playlistId = mockPlaylist.id

      mockPrismaService.playlist.delete.mockResolvedValue(mockPlaylist)

      const result = await service.delete(userId, playlistId)

      expect(mockPrismaService.playlist.delete).toHaveBeenCalledWith({
        where: {
          id: playlistId,
          userId
        }
      })
      expect(result).toEqual(mockPlaylist)
    })

    it('should throw error when trying to delete non-existent playlist', async () => {
      const userId = mockUser.id
      const playlistId = 'non-existent-id'
      const error = new Error('Record not found')

      mockPrismaService.playlist.delete.mockRejectedValue(error)

      await expect(service.delete(userId, playlistId)).rejects.toThrow(error)
      expect(mockPrismaService.playlist.delete).toHaveBeenCalledWith({
        where: {
          id: playlistId,
          userId
        }
      })
    })
  })
})
