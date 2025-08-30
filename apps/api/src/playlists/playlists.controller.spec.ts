import { Test, TestingModule } from '@nestjs/testing'
import { AuthGuard } from 'src/auth/auth.guard'
import { UserEntity } from 'src/users/entities'

import { CreatePlaylistDto } from './dtos/create-playlist.dto'
import { UpdatePlaylistDto } from './dtos/update-playlist.dto'

import { PlaylistsController } from './playlists.controller'
import { PlaylistsService } from './playlists.service'

interface MockRequest {
  user: UserEntity
}

describe('PlaylistsController', () => {
  let controller: PlaylistsController

  const mockPlaylistsService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
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
    username: 'testuser',
    email: 'test@example.com'
  } as UserEntity

  const mockRequest: MockRequest = {
    user: mockUser
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistsController],
      providers: [
        {
          provide: PlaylistsService,
          useValue: mockPlaylistsService
        }
      ]
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile()

    controller = module.get<PlaylistsController>(PlaylistsController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getAll', () => {
    it('should return all playlists with default pagination', async () => {
      const mockPlaylists = [
        {
          ...mockPlaylist,
          user: { id: mockUser.id, username: mockUser.username }
        }
      ]
      mockPlaylistsService.getAll.mockResolvedValue(mockPlaylists)

      const result = await controller.getAll()

      expect(mockPlaylistsService.getAll).toHaveBeenCalledWith({
        limit: undefined,
        page: undefined
      })
      expect(result).toEqual(mockPlaylists)
    })

    it('should return playlists with custom pagination', async () => {
      const page = 2
      const limit = 5
      const mockPlaylists = [
        {
          ...mockPlaylist,
          user: { id: mockUser.id, username: mockUser.username }
        }
      ]
      mockPlaylistsService.getAll.mockResolvedValue(mockPlaylists)

      const result = await controller.getAll(page, limit)

      expect(mockPlaylistsService.getAll).toHaveBeenCalledWith({
        limit,
        page
      })
      expect(result).toEqual(mockPlaylists)
    })
  })

  describe('getById', () => {
    it('should return a playlist by id', async () => {
      const playlistId = mockPlaylist.id
      mockPlaylistsService.getById.mockResolvedValue(mockPlaylist)

      const result = await controller.getById(playlistId)

      expect(mockPlaylistsService.getById).toHaveBeenCalledWith(playlistId)
      expect(result).toEqual(mockPlaylist)
    })

    it('should handle errors when playlist not found', async () => {
      const playlistId = 'non-existent-id'
      const error = new Error('Playlist not found')
      mockPlaylistsService.getById.mockRejectedValue(error)

      await expect(controller.getById(playlistId)).rejects.toThrow(error)
      expect(mockPlaylistsService.getById).toHaveBeenCalledWith(playlistId)
    })
  })

  describe('post', () => {
    it('should create a new playlist', async () => {
      const createPlaylistDto: CreatePlaylistDto = {
        title: 'New Playlist',
        description: 'New description'
      }
      const expectedPlaylist = {
        ...mockPlaylist,
        ...createPlaylistDto,
        userId: mockUser.id
      }

      mockPlaylistsService.create.mockResolvedValue(expectedPlaylist)

      const result = await controller.post(
        mockRequest as never,
        createPlaylistDto
      )

      expect(mockPlaylistsService.create).toHaveBeenCalledWith(
        mockUser.id,
        createPlaylistDto
      )
      expect(result).toEqual(expectedPlaylist)
    })

    it('should create a playlist without description', async () => {
      const createPlaylistDto: CreatePlaylistDto = {
        title: 'New Playlist'
      }
      const expectedPlaylist = {
        ...mockPlaylist,
        title: createPlaylistDto.title,
        description: null,
        userId: mockUser.id
      }

      mockPlaylistsService.create.mockResolvedValue(expectedPlaylist)

      const result = await controller.post(
        mockRequest as never,
        createPlaylistDto
      )

      expect(mockPlaylistsService.create).toHaveBeenCalledWith(
        mockUser.id,
        createPlaylistDto
      )
      expect(result).toEqual(expectedPlaylist)
    })

    it('should handle creation errors', async () => {
      const createPlaylistDto: CreatePlaylistDto = {
        title: 'New Playlist'
      }
      const error = new Error('Creation failed')
      mockPlaylistsService.create.mockRejectedValue(error)

      await expect(
        controller.post(mockRequest as never, createPlaylistDto)
      ).rejects.toThrow(error)
      expect(mockPlaylistsService.create).toHaveBeenCalledWith(
        mockUser.id,
        createPlaylistDto
      )
    })
  })

  describe('update', () => {
    it('should update a playlist', async () => {
      const playlistId = mockPlaylist.id
      const updatePlaylistDto: UpdatePlaylistDto = {
        title: 'Updated Playlist',
        description: 'Updated description'
      }
      const expectedPlaylist = {
        ...mockPlaylist,
        ...updatePlaylistDto
      }

      mockPlaylistsService.update.mockResolvedValue(expectedPlaylist)

      const result = await controller.update(
        mockRequest as never,
        playlistId,
        updatePlaylistDto
      )

      expect(mockPlaylistsService.update).toHaveBeenCalledWith(
        mockUser.id,
        playlistId,
        updatePlaylistDto
      )
      expect(result).toEqual(expectedPlaylist)
    })

    it('should update only provided fields', async () => {
      const playlistId = mockPlaylist.id
      const updatePlaylistDto: UpdatePlaylistDto = {
        title: 'Updated Title'
      }
      const expectedPlaylist = {
        ...mockPlaylist,
        title: updatePlaylistDto.title
      }

      mockPlaylistsService.update.mockResolvedValue(expectedPlaylist)

      const result = await controller.update(
        mockRequest as never,
        playlistId,
        updatePlaylistDto
      )

      expect(mockPlaylistsService.update).toHaveBeenCalledWith(
        mockUser.id,
        playlistId,
        updatePlaylistDto
      )
      expect(result).toEqual(expectedPlaylist)
    })

    it('should handle update errors', async () => {
      const playlistId = 'non-existent-id'
      const updatePlaylistDto: UpdatePlaylistDto = {
        title: 'Updated Title'
      }
      const error = new Error('Update failed')
      mockPlaylistsService.update.mockRejectedValue(error)

      await expect(
        controller.update(mockRequest as never, playlistId, updatePlaylistDto)
      ).rejects.toThrow(error)
      expect(mockPlaylistsService.update).toHaveBeenCalledWith(
        mockUser.id,
        playlistId,
        updatePlaylistDto
      )
    })
  })
})
