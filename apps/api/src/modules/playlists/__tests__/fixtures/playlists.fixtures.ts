import type { UserEntity } from '@modules/users'
import type { PlaylistEntity } from '../../entities'
import type { PlaylistsService } from '../../playlists.service'

/** Defines the find all result. */
export type FindAllResult = Awaited<ReturnType<PlaylistsService['getAll']>>
/** Defines the get by id result. */
export type GetByIdResult = Awaited<ReturnType<PlaylistsService['getByIdPopulated']>>

/** The build playlist value. */
export const buildPlaylist = (overrides: Partial<PlaylistEntity> = {}): PlaylistEntity => ({
  id: 'playlist-1',
  title: 'My Playlist',
  cover: 'cover.png',
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user-1',
  isPublic: true,
  collaborative: false,
  followersCount: 0,
  deletedAt: null,
  ...overrides,
})

/** The build user value. */
export const buildUser = (overrides: Partial<UserEntity> = {}): UserEntity => ({
  id: 'user-1',
  username: 'user',
  email: 'user@example.com',
  password: 'hashed-password',
  avatar: null,
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  twoFactorSecret: null,
  twoFactorEnabled: false,
  emailVerifiedAt: null,
  failedLoginAttempts: 0,
  lockedUntil: null,
  deletedAt: null,
  ...overrides,
})

/** The build playlist with user value. */
export const buildPlaylistWithUser = (overrides: Partial<FindAllResult['data'][number]> = {}) => ({
  ...buildPlaylist(),
  user: {
    id: 'user-1',
    username: 'user',
  },
  ...overrides,
})

/** The build playlist with tracks value. */
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
