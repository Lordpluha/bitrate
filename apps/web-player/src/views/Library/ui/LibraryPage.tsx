'use client'

import { Button } from '@bitrate/ui-react'
import { ErrorState, Skeleton } from '@shared/ui'
import { Plus } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LIBRARY_SORT_STORAGE_KEY } from '@/shared/constants'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import type { LibraryControls } from '@/views/Library/model/library.types'
import { useLibraryData } from '@/views/Library/model/useLibraryData'
import { AlbumLibrarySection } from '@/views/Library/ui/AlbumLibrarySection'
import { CreatePlaylistForm } from '@/views/Library/ui/CreatePlaylistForm'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<Omit<LibraryControls, 'sortMode'>>({
    activeSection: 'playlists',
    query: '',
    viewMode: 'list',
  })
  /** The same stored sort as the library panel; its "Creator" sort has no column here. */
  const [storedSort, setStoredSort] = usePersistedState<unknown>(
    LIBRARY_SORT_STORAGE_KEY,
    'recent',
  )
  const controls: LibraryControls = {
    ...state,
    sortMode: storedSort === 'title' ? 'title' : 'recent',
  }
  const setControls = (
    update: (current: LibraryControls) => LibraryControls,
  ) => {
    const { sortMode, ...next } = update(controls)
    setState(next)
    if (sortMode !== controls.sortMode) setStoredSort(sortMode)
  }
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const library = useLibraryData(controls)

  useEffect(() => {
    if (searchParams.get('create') !== 'playlist') return

    setState((current) => ({ ...current, activeSection: 'playlists' }))
    setIsCreateOpen(true)
    /* drop the flag so the next "Create playlist" opens the form again */
    router.replace(ROUTES.library)
  }, [router, searchParams])

  return (
    <div className="h-full overflow-y-auto px-4 pt-2 pb-3 custom-scrollbar md:px-8 md:py-6">
      <div className="flex flex-col gap-5 md:gap-7">
        <div className="flex items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs font-semibold tracking-[1.2px] text-muted-foreground uppercase">
              {t('library.title')}
            </p>
            <h1 className="text-2xl leading-[1.1] font-bold text-foreground md:text-[32px]">
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
        ) : library.isError ? (
          <ErrorState
            description="Something went wrong on our side. Try again."
            onRetry={library.refetch}
            title="Your library could not be loaded"
          />
        ) : controls.activeSection === 'playlists' ? (
          <PlaylistLibrarySection
            playlists={library.playlists}
            viewMode={controls.viewMode}
          />
        ) : controls.activeSection === 'liked' ? (
          <LikedTracksLibrarySection tracks={library.tracks} />
        ) : (
          <AlbumLibrarySection
            albums={library.albums}
            viewMode={controls.viewMode}
          />
        )}
      </div>
    </div>
  )
}
