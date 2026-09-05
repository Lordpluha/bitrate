import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bitrate',
    short_name: 'Bitrate',
    description: 'Listen to music, build playlists and follow artists.',
    start_url: '/main',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#0b0d12',
    theme_color: '#7c3aed',
    categories: ['music', 'entertainment'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
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
