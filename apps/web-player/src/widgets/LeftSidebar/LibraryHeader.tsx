'use client'

import { PlusIcon, Typography } from '@bitrate/ui-react'
import { Library, Maximize2, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
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
  isExpanded = false,
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
        <Library
          aria-hidden="true"
          className="mr-2.5 size-5 shrink-0 text-accent"
        />
        <Typography
          as="h2"
          className="truncate font-[family-name:var(--font-landing-body)] text-[17px] leading-[1.3] font-semibold"
          size="heading6"
        >
          {t('library.title')}
        </Typography>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {isExpanded ? (
          <CreatePlaylistMenu
            isPending={playlist.isPending}
            onCreate={playlist.create}
          />
        ) : null}
        <button
          aria-label={t('library.title')}
          className="flex size-7 items-center justify-center rounded-[7px] border border-primary bg-secondary text-accent transition-colors hover:bg-surface"
          onClick={onToggleExpanded}
          title={t('library.title')}
          type="button"
        >
          <Maximize2 aria-hidden="true" size={14} />
        </button>
      </div>
    </div>
  )
}
