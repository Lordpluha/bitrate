const DEFAULT_SITE_URL = 'http://localhost:3001'

/** Public origin of the web player, used for canonical URLs and the sitemap. */
export const getSiteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, '')

export const SITE_NAME = 'Spotify clone'

export const SITE_DESCRIPTION =
  'Listen to music, build playlists and follow artists.'
