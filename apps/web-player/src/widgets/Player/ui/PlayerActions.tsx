'use client'

import { ROUTES } from '@shared/routes'
import {
  ListMusic,
  Maximize2,
  Mic2,
  PictureInPicture2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import Link from 'next/link'
import type { ChangeEvent } from 'react'
import { ConnectDevicesPopover } from '@/features/BitrateConnect'
import { useI18n } from '@/shared/i18n'

/** The player bar's 17px icons in 32px targets. */
const iconButtonClassName =
  'flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground'
const ICON_SIZE = 17

interface PlayerActionsProps {
  volume: number
  onVolumeChange: (volume: number) => void
  onExpand?: () => void
  onPictureInPicture?: () => void
}

/**
 * The player bar's Player Actions: lyrics, queue, Bitrate Connect, the floating mini player,
 * volume on an 86px rail and the full player.
 */
export const PlayerActions = ({
  volume,
  onVolumeChange,
  onExpand,
  onPictureInPicture,
}: PlayerActionsProps) => {
  const { t } = useI18n()
  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(e.target.value))
  }

  const toggleMute = () => {
    onVolumeChange(volume > 0 ? 0 : 0.5)
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        aria-label={t('player.openLyrics')}
        className={iconButtonClassName}
        href={ROUTES.lyrics}
      >
        <Mic2 size={ICON_SIZE} />
      </Link>
      <Link
        aria-label={t('player.openQueue')}
        className={iconButtonClassName}
        href={ROUTES.queue}
      >
        <ListMusic size={ICON_SIZE} />
      </Link>
      <ConnectDevicesPopover
        iconSize={ICON_SIZE}
        triggerClassName={iconButtonClassName}
      />
      <button
        aria-label={t('player.openFloating')}
        className={iconButtonClassName}
        onClick={onPictureInPicture}
        type="button"
      >
        <PictureInPicture2 size={ICON_SIZE} />
      </button>
      <button
        aria-label={volume === 0 ? t('player.unmute') : t('player.mute')}
        className={iconButtonClassName}
        onClick={toggleMute}
        type="button"
      >
        {volume === 0 ? (
          <VolumeX size={ICON_SIZE} />
        ) : (
          <Volume2 size={ICON_SIZE} />
        )}
      </button>
      <div className="group relative flex h-3.5 w-21.5 shrink-0 items-center">
        <div className="relative h-0.75 w-full rounded-full bg-progress-track">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: `${volume * 100}%` }}
          >
            <span className="absolute top-1/2 right-0 size-2.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 group-has-focus-visible:opacity-100" />
          </div>
        </div>
        <input
          aria-label={t('player.volume')}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          max="1"
          min="0"
          onChange={handleVolumeChange}
          step="0.01"
          type="range"
          value={volume}
        />
      </div>
      <button
        aria-label={t('player.openFull')}
        className={iconButtonClassName}
        onClick={onExpand}
        type="button"
      >
        <Maximize2 size={ICON_SIZE} />
      </button>
    </div>
  )
}
