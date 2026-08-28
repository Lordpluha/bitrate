'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useI18n } from '@/shared/i18n'
import type { LibraryControls } from '@/views/Library/model/library.types'
import { useLibraryData } from '@/views/Library/model/useLibraryData'
import { AlbumLibrarySection } from '@/views/Library/ui/AlbumLibrarySection'
import { CreatePlaylistForm } from '@/views/Library/ui/CreatePlaylistForm'
import { HistoryLibrarySection } from '@/views/Library/ui/HistoryLibrarySection'
import { LibraryToolbar } from '@/views/Library/ui/LibraryToolbar'
import { LikedTracksLibrarySection } from '@/views/Library/ui/LikedTracksLibrarySection'
import { PlaylistLibrarySection } from '@/views/Library/ui/PlaylistLibrarySection'

export const LibraryPage = () => {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const [controls, setControls] = useState<LibraryControls>({
    activeSection: 'playlists',
    query: '',
    sortMode: 'recent',
    viewMode: 'list',
  })
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const library = useLibraryData(controls)

  useEffect(() => {
    if (searchParams.get('create') !== 'playlist') return

    setControls((current) => ({ ...current, activeSection: 'playlists' }))
    setIsCreateOpen(true)
  }, [searchParams])

  return (
    <div className="h-full overflow-y-auto px-4 py-5 custom-scrollbar sm:px-6">
      <div className="flex flex-col gap-4">
        <div className="max-xl:hidden">
          <p className="text-sm text-text-subdued">{t('library.title')}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-text sm:text-4xl">
              {t('library.heading')}
            </h1>
            <button
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-hover max-[420px]:w-full"
              onClick={() => setIsCreateOpen((value) => !value)}
              type="button"
            >
              {t('library.createPlaylist')}
            </button>
          </div>
        </div>

        <CreatePlaylistForm
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />

        <LibraryToolbar
          controls={controls}
          onChange={(nextControls) =>
            setControls((current) => ({ ...current, ...nextControls }))
          }
        />
      </div>

      <div className="mt-5 sm:mt-8">
        {library.isPending ? (
          <div className="text-text-subdued">{t('library.loading')}</div>
        ) : controls.activeSection === 'playlists' ? (
          <PlaylistLibrarySection
            playlists={library.playlists}
            viewMode={controls.viewMode}
          />
        ) : controls.activeSection === 'liked' ? (
          <LikedTracksLibrarySection tracks={library.tracks} />
        ) : controls.activeSection === 'albums' ? (
          <AlbumLibrarySection
            albums={library.albums}
            viewMode={controls.viewMode}
          />
        ) : (
          <HistoryLibrarySection history={library.history} />
        )}
      </div>
    </div>
  )
}
