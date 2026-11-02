export type HomeTabId = 'all' | 'music'

export type HomeTab = {
  id: HomeTabId
  label: string
}

export const homeTabs: HomeTab[] = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
]
