'use client'

import { ListPlus, Pause, Play, Trash2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useTrackContextMenu } from '@/entities/Track/models/useTrackContextMenu'
import type { TrackContextMenuPosition } from '@/entities/Track/models/useTrackContextMenuPosition'
import { useI18n } from '@/shared/i18n'

type TrackContextMenuProps = {
  isPlaying: boolean
  onAddToQueue: () => void
  onClose: () => void
  onPlay: () => void
  onRemove?: () => void
  position: TrackContextMenuPosition
}

export const TrackContextMenu = ({
  isPlaying,
  onAddToQueue,
  onClose,
  onPlay,
  onRemove,
  position,
}: TrackContextMenuProps) => {
  const { t } = useI18n()
  const { handleMenuKeyDown, menuRef, runAction } = useTrackContextMenu(onClose)

  return createPortal(
    <div
      aria-label={t('trackMenu.actions')}
      className="fixed z-[200] w-56 rounded-md bg-popover p-1 text-sm text-text shadow-2xl"
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={handleMenuKeyDown}
      onPointerDown={(event) => event.stopPropagation()}
      ref={menuRef}
      role="menu"
      style={position}
    >
      <button
        className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors hover:bg-white/10"
        onClick={() => runAction(onPlay)}
        role="menuitem"
        type="button"
      >
        {isPlaying ? (
          <Pause aria-hidden="true" size={17} />
        ) : (
          <Play aria-hidden="true" size={17} />
        )}
        {isPlaying ? t('trackMenu.pause') : t('trackMenu.play')}
      </button>
      <button
        className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors hover:bg-white/10"
        onClick={() => runAction(onAddToQueue)}
        role="menuitem"
        type="button"
      >
        <ListPlus aria-hidden="true" size={17} />
        {t('trackMenu.addToQueue')}
      </button>
      {onRemove ? (
        <button
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors hover:bg-white/10"
          onClick={() => runAction(onRemove)}
          role="menuitem"
          type="button"
        >
          <Trash2 aria-hidden="true" size={17} />
          {t('trackMenu.remove')}
        </button>
      ) : null}
    </div>,
    document.body,
  )
}
