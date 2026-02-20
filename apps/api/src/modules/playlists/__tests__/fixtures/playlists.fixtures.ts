import type { UserEntity } from '@modules/users'
import type { PlaylistEntity } from '../../entities'
import type { PlaylistsService } from '../../playlists.service'

export type FindAllResult = Awaited<ReturnType<PlaylistsService['getAll']>>
export type GetByIdResult = Awaited<ReturnType<PlaylistsService['getByIdPopulated']>>

export const buildPlaylist = (overrides: Partial<PlaylistEntity> = {}): PlaylistEntity => ({
  id: 'playlist-1',
  title: 'My Playlist',
  cover: 'cover.png',
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user-1',
  isPublic: true,
  ...overrides,
})

export const buildUser = (overrides: Partial<UserEntity> = {}): UserEntity => ({
  id: 'user-1',
  username: 'user',
  email: 'user@example.com',
  password: 'hashed-password',
  avatar: null,
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const buildPlaylistWithUser = (overrides: Partial<FindAllResult[number]> = {}) => ({
  ...buildPlaylist(),
  user: {
    id: 'user-1',
    username: 'user',
  },
  ...overrides,
})

export const buildPlaylistWithTracks = (overrides: Partial<GetByIdResult> = {}): GetByIdResult => ({
  ...buildPlaylist(),
  tracks: [],
  user: {
    id: 'user-1',
    username: 'user',
    avatar: null,
  },
  ...overrides,
})
