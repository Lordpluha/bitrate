/** The user id value. */
export const USER_ID = '22222222-2222-2222-2222-222222222222'
/** The playlist id value. */
export const PLAYLIST_ID = '11111111-1111-1111-1111-111111111111'

/** The build user value. */
export const buildUser = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: USER_ID,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  username: 'user',
  email: 'user@example.com',
  password: 'password123',
  avatar: null,
  description: null,
  ...overrides,
})

/** The build playlist value. */
export const buildPlaylist = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: PLAYLIST_ID,
  title: 'Playlist title',
  cover: 'cover.png',
  userId: USER_ID,
  description: null,
  isPublic: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
})
