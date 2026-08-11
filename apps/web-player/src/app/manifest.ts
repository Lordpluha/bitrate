import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Spotify clone',
    short_name: 'Spotify',
    description: 'Listen to music, build playlists and follow artists.',
    start_url: '/main',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#121212',
    theme_color: '#121212',
    categories: ['music', 'entertainment'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      { name: 'Search', url: '/main/search' },
      { name: 'Your Library', url: '/main/library' },
      { name: 'Liked Songs', url: '/main/liked-songs' },
    ],
  }
}
