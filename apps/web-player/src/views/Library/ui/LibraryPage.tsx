'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type {
  LibrarySection,
  SortMode,
} from '@/views/Library/model/library.types'
import { useLibraryData } from '@/views/Library/model/useLibraryData'
import { AlbumLibrarySection } from '@/views/Library/ui/AlbumLibrarySection'
import { CreatePlaylistForm } from '@/views/Library/ui/CreatePlaylistForm'
import { HistoryLibrarySection } from '@/views/Library/ui/HistoryLibrarySection'
import { LibraryToolbar } from '@/views/Library/ui/LibraryToolbar'
import { LikedTracksLibrarySection } from '@/views/Library/ui/LikedTracksLibrarySection'
import { PlaylistLibrarySection } from '@/views/Library/ui/PlaylistLibrarySection'

export const LibraryPage = () => {
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] =
    useState<LibrarySection>('playlists')
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('recent')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const library = useLibraryData({ activeSection, query, sortMode })

  useEffect(() => {
    if (searchParams.get('create') !== 'playlist') return

    setActiveSection('playlists')
    setIsCreateOpen(true)
  }, [searchParams])

  return (
    <div className="h-full overflow-y-auto custom-scrollbar px-6 py-5">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-text-subdued">Your Library</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-4xl font-bold text-text">Library</h1>
            <button
              className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400"
              onClick={() => setIsCreateOpen((value) => !value)}
              type="button"
            >
              Create playlist
            </button>
          </div>
        </div>

        <CreatePlaylistForm
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />

        <LibraryToolbar
          activeSection={activeSection}
          onQueryChange={setQuery}
          onSectionChange={setActiveSection}
          onSortChange={setSortMode}
        />
      </div>

      <div className="mt-8">
        {library.isPending ? (
          <div className="text-text-subdued">Loading library...</div>
        ) : activeSection === 'playlists' ? (
          <PlaylistLibrarySection playlists={library.playlists} />
        ) : activeSection === 'liked' ? (
          <LikedTracksLibrarySection tracks={library.tracks} />
        ) : activeSection === 'albums' ? (
          <AlbumLibrarySection albums={library.albums} />
        ) : (
          <HistoryLibrarySection history={library.history} />
        )}
      </div>
    </div>
  )
}
