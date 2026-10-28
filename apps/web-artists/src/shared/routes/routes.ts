export const ROUTES = {
  landing: '/',
  auth: {
    login: '/login',
    registration: '/registration',
    verifyEmail: '/verify-email',
    forgotPassword: '/forgot-password',
  },
  dashboard: {
    home: '/dashboard',
    music: '/dashboard/music',
    distribution: '/dashboard/distribution',
    analytics: '/dashboard/analytics',
    profile: '/dashboard/profile',
    settings: '/dashboard/settings',
  },
  main: '/',
  legal: (slug: string) => `/legal/${slug}`,
  terms: '/legal/terms',
  artistAgreement: '/legal/artist-agreement',
  privacy: '/legal/privacy',
  community: '/legal/community',
  complaints: '/legal/complaints',
  copyright: '/legal/copyright',
} as const

/** Public player address; deployments map the player's `NEXT_PUBLIC_SITE_URL` to it. */
const PLAYER_URL = import.meta.env.VITE_PLAYER_URL || 'http://localhost:3001'

/** Links into the Bitrate player, which is a separate app on its own origin. */
export const PLAYER_ROUTES = {
  /** Mirrors `ROUTES.album` in `apps/web-player`. */
  album: (albumId: string) =>
    new URL(
      `/main/album/${encodeURIComponent(albumId)}`,
      PLAYER_URL,
    ).toString(),
} as const
