import type { WebPlayerSearchType } from '@/features/Search/api/client'

export const searchTypes: WebPlayerSearchType[] = [
  'tracks',
  'artists',
  'albums',
  'playlists',
]

export const searchFilterTabs = [
  'All',
  'Songs',
  'Artists',
  'Albums',
  'Playlists',
  'Profiles',
] as const
