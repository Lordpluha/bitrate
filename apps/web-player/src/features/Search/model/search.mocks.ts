import { browseImages } from '@/features/Search/model/search.constants'
import type { MediaCardItem } from '@/features/Search/model/types'

export const getMockDescription = (category: string, title: string) => {
  if (category === 'Podcasts') return `${title} shows and episodes`
  if (category === 'Live Events')
    return `${title} picks for your next night out`
  return `${title} music picked for this category`
}

export const buildMockMixes = (category: string): MediaCardItem[] => [
  {
    description: `Songs you keep coming back to in ${category}`,
    image: browseImages[4],
    title: 'On Repeat',
  },
  {
    description: 'Your past favorites, refreshed',
    image: browseImages[5],
    title: 'Repeat Rewind',
  },
  {
    description: `A daily mix shaped around ${category}`,
    image: browseImages[6],
    title: 'Daily Mix 01',
  },
]

export const buildMockCharts = (): MediaCardItem[] => [
  {
    description: 'Your weekly update of the most played tracks',
    image: browseImages[5],
    title: 'Top Songs Global',
  },
  {
    description: 'The biggest tracks in your region right now',
    image: browseImages[6],
    title: 'Top Songs Ukraine',
  },
  {
    description: 'Daily global chart from listeners',
    image: browseImages[0],
    title: 'Top 50 Global',
  },
  {
    description: 'Daily local chart from listeners',
    image: browseImages[1],
    title: 'Top 50 Ukraine',
  },
]

export const buildMockDailyMixes = (category: string): MediaCardItem[] =>
  Array.from({ length: 6 }, (_, index) => ({
    description: `${category}, favorites and similar picks`,
    image: browseImages[index % browseImages.length] ?? browseImages[0],
    title: `Daily Mix ${index + 1}`,
  }))

export const buildMockArtistMixes = (): MediaCardItem[] =>
  [
    'Eminem Mix',
    'NUEKI Mix',
    'Shiro SAGISU Mix',
    'Willix Mix',
    'LXNGVX Mix',
    'KUTE Mix',
  ].map((title, index) => ({
    description: 'Made from your listening style',
    image: browseImages[(index + 2) % browseImages.length] ?? browseImages[0],
    title,
  }))
