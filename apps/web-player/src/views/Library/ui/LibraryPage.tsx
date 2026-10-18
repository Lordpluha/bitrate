'use client'

import { Button } from '@bitrate/ui-react'
import { Skeleton } from '@shared/ui'
import { Plus } from 'lucide-react'
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

/** Placeholder cards while the library loads: two rows of the five-column grid. */
const LOADING_CARD_KEYS = Array.from(
  { length: 10 },
  (_, card) => `library-card-${card}`,
)

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
    <div className="h-full overflow-y-auto px-4 pt-2 pb-3 custom-scrollbar md:px-8 md:py-6">
      <div className="flex flex-col gap-5 md:gap-7">
        <div className="flex items-end justify-between gap-4 max-xl:hidden">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs font-semibold tracking-[1.2px] text-muted-foreground uppercase">
              {t('library.title')}
            </p>
            <h1 className="text-[32px] leading-[1.1] font-bold text-foreground">
              {t('library.heading')}
            </h1>
          </div>
          <Button
            className="h-9 gap-2 px-4 text-sm font-medium"
            onClick={() => setIsCreateOpen((value) => !value)}
            variant="primary"
          >
            <Plus aria-hidden="true" size={16} />
            {t('library.createPlaylist')}
          </Button>
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

      <div className="mt-5 md:mt-7">
        {library.isPending ? (
          <div
            aria-label={t('library.loading')}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5.5"
            role="status"
          >
            {LOADING_CARD_KEYS.map((key) => (
              <Skeleton className="aspect-[4/5] rounded-[14px]" key={key} />
            ))}
          </div>
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
