export type HomeTabId = 'all' | 'music' | 'podcasts'

export type HomeTab = {
  id: HomeTabId
  label: string
}

export const homeTabs: HomeTab[] = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'podcasts', label: 'Podcasts' },
]
