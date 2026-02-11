import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import type { AlbumsService } from '../../albums.service'

export type FindAllResult = Awaited<ReturnType<AlbumsService['findAll']>>
export type GetByIdResult = NonNullable<Awaited<ReturnType<AlbumsService['getById']>>>

export const buildAlbum = (overrides: Partial<GetByIdResult> = {}): GetByIdResult => ({
  id: 'album-1',
  title: 'Album title',
  cover: 'cover.png',
  artistId: 'artist-1',
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  releaseDate: null,
  tracks: [],
  ...overrides,
})

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
  ...overrides,
})
