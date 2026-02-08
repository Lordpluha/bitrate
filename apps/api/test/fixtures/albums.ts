export const ARTIST_ID = '22222222-2222-2222-2222-222222222222'
export const ALBUM_ID = '11111111-1111-1111-1111-111111111111'

export const buildArtist = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: ARTIST_ID,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  username: 'artist',
  email: 'artist@example.com',
  password: 'password123',
  bio: null,
  avatar: null,
  backgroundImage: null,
  ...overrides,
})

export const buildAlbum = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: ALBUM_ID,
  title: 'Album title',
  cover: 'cover.png',
  artistId: ARTIST_ID,
  description: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  releaseDate: null,
  tracks: [],
  ...overrides,
})
