'use client'

import { usePlayCollection } from '@/features/PlayCollection'
import { SearchPage } from '@/features/Search'

/** The search route: the search feature, with card play buttons that start playback in place. */
export const SearchView = () => {
  const playCollection = usePlayCollection()

  return (
    <SearchPage
      onPlayItem={(item) => {
        if (!item.playKind) return
        void playCollection({
          id: item.id,
          kind: item.playKind,
          title: item.title,
        })
      }}
    />
  )
}
