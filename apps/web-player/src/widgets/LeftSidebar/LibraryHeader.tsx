'use client'

import { PlusIcon, Typography } from '@spotify/ui-react'
import { Maximize2, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import { CreatePlaylistMenu } from '@/widgets/LeftSidebar/CreatePlaylistMenu'
import { useCreateLibraryPlaylist } from '@/widgets/LeftSidebar/model/useCreateLibraryPlaylist'

type LibraryHeaderProps = {
  isCollapsed?: boolean
  isExpanded?: boolean
  onToggleCollapsed?: () => void
  onToggleExpanded?: () => void
}

export const LibraryHeader = ({
  isCollapsed = false,
  onToggleCollapsed,
  onToggleExpanded,
}: LibraryHeaderProps) => {
  const { t } = useI18n()
  const playlist = useCreateLibraryPlaylist()
  const openLabel = t('library.title')

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          aria-label={openLabel}
          className="rounded-md p-2 text-text-subdued transition-colors hover:bg-surface hover:text-text"
          onClick={onToggleCollapsed}
          title={openLabel}
          type="button"
        >
          <PanelLeftOpen size={22} />
        </button>
        <button
          aria-label={t('library.createPlaylist')}
          className="rounded-full bg-surface p-3 text-text transition-colors hover:bg-surface-hover"
          disabled={playlist.isPending}
          onClick={playlist.create}
          title={t('common.create')}
          type="button"
        >
          <PlusIcon />
        </button>
      </div>
    )
  }

  return (
    <div className="group/header flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center">
        <div className="w-0 overflow-hidden opacity-0 transition-[width,opacity] duration-200 ease-out group-hover/header:w-8 group-hover/header:opacity-100">
          <button
            aria-label={t('library.title')}
            className="mr-2 rounded p-1 text-text-subdued transition-colors hover:bg-surface hover:text-text"
            onClick={onToggleCollapsed}
            title={t('library.title')}
            type="button"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
        <Typography as="h6" className="truncate" size="heading6">
          {t('library.title')}
        </Typography>
      </div>
      <div className="flex items-center gap-2">
        <CreatePlaylistMenu
          isPending={playlist.isPending}
          onCreate={playlist.create}
        />
        <button
          aria-label={t('library.title')}
          className="duration-200 hover:opacity-70"
          onClick={onToggleExpanded}
          title={t('library.title')}
          type="button"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  )
}
