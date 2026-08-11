import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import type { AlbumsService } from '../../albums.service'

/** Defines the find all result. */
export type FindAllResult = Awaited<ReturnType<AlbumsService['findAll']>>
/** Defines the get by id result. */
export type GetByIdResult = NonNullable<Awaited<ReturnType<AlbumsService['getById']>>>

/** The build album value. */
export const buildAlbum = (overrides: Partial<GetByIdResult> = {}): GetByIdResult => ({
  id: 'album-1',
  title: 'Album title',
  cover: 'cover.png',
  artistId: 'artist-1',
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  releaseDate: null,
  type: 'ALBUM',
  label: null,
  totalTracks: 0,
  copyright: null,
  deletedAt: null,
  tracks: [],
  ...overrides,
})

/** The build artist value. */
export const buildArtist = (
  overrides: Partial<ArtistAuthRequest['artist']> = {},
): ArtistAuthRequest['artist'] => ({
  id: 'artist-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  username: 'artist',
  email: 'artist@example.com',
  password: 'hashed-password',
  bio: null,
  avatar: null,
  backgroundImage: null,
  twoFactorSecret: null,
  twoFactorEnabled: false,
  emailVerifiedAt: null,
  failedLoginAttempts: 0,
  lockedUntil: null,
  verified: false,
  monthlyListeners: 0,
  country: null,
  socials: null,
  deletedAt: null,
  ...overrides,
})
