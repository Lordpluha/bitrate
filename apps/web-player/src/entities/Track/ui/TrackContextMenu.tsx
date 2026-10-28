'use client'

import { cn } from '@bitrate/ui-react'
import { menuItemClassName, menuPanelClassName } from '@shared/ui'
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
      className={cn('fixed z-[200] w-56', menuPanelClassName)}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={handleMenuKeyDown}
      onPointerDown={(event) => event.stopPropagation()}
      ref={menuRef}
      role="menu"
      style={position}
    >
      <button
        className={menuItemClassName}
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
        className={menuItemClassName}
        onClick={() => runAction(onAddToQueue)}
        role="menuitem"
        type="button"
      >
        <ListPlus aria-hidden="true" size={17} />
        {t('trackMenu.addToQueue')}
      </button>
      {onRemove ? (
        <button
          className={menuItemClassName}
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
