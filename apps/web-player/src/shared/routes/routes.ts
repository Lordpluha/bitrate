export const ROUTES = {
  landing: '/',
  auth: {
    login: '/auth/login',
    twoFactorLogin: '/auth/login/2fa',
    registration: '/auth/registration',
    forgotPassword: '/auth/forgot-password',
  },
  main: '/main',
  likedSongs: '/main/liked-songs',
  library: '/main/library',
  createPlaylist: '/main/library?create=playlist',
  profile: '/main/profile',
  recents: '/main/recents',
  settings: '/main/preferences',
  playlist: (id: string) => `/main/playlist/${id}`,
  album: (id: string) => `/main/album/${id}`,
  user: (id: string) => `/main/user/${id}`,
  searchCategory: (category: string) =>
    `/main/search?category=${encodeURIComponent(category)}`,
  search: (query?: string) =>
    query ? `/main/search?q=${encodeURIComponent(query)}` : '/main/search',
  terms: '#terms',
  privacy: '#privacy',
  download: '#download',
  plans: '#plans',
  forStudents: '#for-students',
} as const
