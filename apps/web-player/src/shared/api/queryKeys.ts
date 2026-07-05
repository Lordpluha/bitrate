export const apiQueryKeys = {
  albums: {
    all: ['albums'] as const,
    detail: (albumId: string) => ['albums', 'detail', albumId] as const,
    list: (params: { page?: number; limit?: number; title?: string }) =>
      ['albums', 'list', params] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
  history: {
    all: ['history'] as const,
    list: (params: { page?: number; limit?: number }) =>
      ['history', 'list', params] as const,
  },
  playlists: {
    all: ['playlists'] as const,
    detail: (playlistId: string) =>
      ['playlists', 'detail', playlistId] as const,
    list: (params: { page?: number; limit?: number }) =>
      ['playlists', 'list', params] as const,
    mine: ['playlists', 'mine'] as const,
  },
  search: {
    all: ['search'] as const,
    results: (params: { query: string; types?: string[]; limit?: number }) =>
      ['search', 'results', params] as const,
  },
  tracks: {
    all: ['tracks'] as const,
    detail: (trackId: string) => ['tracks', 'detail', trackId] as const,
    liked: (params: { page?: number; limit?: number }) =>
      ['tracks', 'liked', params] as const,
    list: (params: { page?: number; limit?: number; title?: string }) =>
      ['tracks', 'list', params] as const,
  },
  users: {
    all: ['users'] as const,
    byId: (userId: string) => ['users', 'by-id', userId] as const,
    byUsername: (username: string) =>
      ['users', 'by-username', username] as const,
    search: (params: { username: string; page?: number; limit?: number }) =>
      ['users', 'search', params] as const,
  },
} as const
