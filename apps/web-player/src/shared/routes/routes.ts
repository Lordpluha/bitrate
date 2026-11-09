export const ROUTES = {
  landing: '/',
  /** A landing scene by its id, e.g. `/#library`. */
  landingScene: (id: string) => `/#${id}`,
  auth: {
    login: '/auth/login',
    twoFactorLogin: '/auth/login/2fa',
    registration: '/auth/registration',
    forgotPassword: '/auth/forgot-password',
    resetPassword: (token?: string) =>
      token
        ? `/auth/reset-password?token=${encodeURIComponent(token)}`
        : '/auth/reset-password',
    verifyEmail: (email?: string) =>
      email
        ? `/verify-email?email=${encodeURIComponent(email)}`
        : '/verify-email',
  },
  main: '/main',
  activity: '/main/activity',
  charts: '/main/charts',
  friends: '/main/friends',
  friendRequests: '/main/friends/requests',
  findFriends: '/main/friends/find',
  stats: '/main/stats',
  notifications: '/main/notifications',
  likedSongs: '/main/liked-songs',
  library: '/main/library',
  createPlaylist: '/main/library?create=playlist',
  profile: '/main/profile',
  recents: '/main/recents',
  settings: '/main/preferences',
  queue: '/main/queue',
  lyrics: '/main/lyrics',
  playlist: (id: string) => `/main/playlist/${id}`,
  album: (id: string) => `/main/album/${id}`,
  /** An artist's page by username; usernames may hold spaces and other reserved characters. */
  artist: (username: string) => `/main/artist/${encodeURIComponent(username)}`,
  /**
   * An artist's page by id, only where the username is not at hand (stored notification
   * payloads, track rows that carry just `artistId`). The page redirects it to `artist`.
   */
  artistById: (id: string) => `/main/artist/${encodeURIComponent(id)}`,
  /** A listener's public profile by username. */
  user: (username: string) => `/main/user/${encodeURIComponent(username)}`,
  /** A listener's public profile by id, only where the username is not at hand; redirects to `user`. */
  userById: (id: string) => `/main/user/${encodeURIComponent(id)}`,
  searchCategory: (category: string) =>
    `/main/search?category=${encodeURIComponent(category)}`,
  search: (query?: string) =>
    query ? `/main/search?q=${encodeURIComponent(query)}` : '/main/search',
  legal: (slug: string) => `/legal/${slug}`,
  terms: '/legal/terms',
  privacy: '/legal/privacy',
  community: '/legal/community',
  complaints: '/legal/complaints',
  copyright: '/legal/copyright',
} as const
