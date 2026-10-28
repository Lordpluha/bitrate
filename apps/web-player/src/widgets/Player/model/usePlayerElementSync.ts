'use client'

import type {
  BitratePlayerLabelOverrides,
  BitratePlayerRepeatMode,
} from '@bitrate/player/contract'
import { usePlayerElementStore } from '@entities/Player'
import { useEffect, useMemo } from 'react'
import { useI18n } from '@/shared/i18n'

type UsePlayerElementSyncInput = {
  artist: string
  coverUrl: string
  isShuffled: boolean
  onNext: () => void
  onPrevious: () => void
  onRepeatToggle: () => void
  onShuffleToggle: () => void
  repeatMode: BitratePlayerRepeatMode
  title: string
}

/**
 * Hands the playing element what its mirrors render beyond playback: the track, the
 * shuffle/repeat state, the queue and mode actions, and web-player's translations of every
 * control label.
 */
export const usePlayerElementSync = ({
  artist,
  coverUrl,
  isShuffled,
  onNext,
  onPrevious,
  onRepeatToggle,
  onShuffleToggle,
  repeatMode,
  title,
}: UsePlayerElementSyncInput) => {
  const { t } = useI18n()
  const element = usePlayerElementStore((state) => state.element)

  const labels = useMemo<BitratePlayerLabelOverrides>(
    () => ({
      disableShuffle: t('playlist.disableShuffle'),
      enableShuffle: t('player.enableShuffle'),
      mute: t('player.mute'),
      next: t('player.next'),
      openFloating: t('player.openFloating'),
      openFull: t('player.openFull'),
      openQueue: t('player.openQueue'),
      pause: () => t('trackMenu.pause'),
      play: () => t('trackMenu.play'),
      previous: t('player.previous'),
      quality: t('player.quality'),
      qualityAuto: t('player.qualityAuto'),
      qualityOption: (kbps) => t('player.qualityOption', { kbps }),
      repeat: {
        all: t('player.repeatOne'),
        off: t('player.repeatPlaylist'),
        one: t('player.disableRepeat'),
      },
      seek: t('player.seek'),
      unmute: t('player.unmute'),
      volume: t('player.volume'),
    }),
    [t],
  )

  useEffect(() => {
    if (element) element.labels = labels
  }, [element, labels])

  useEffect(() => {
    if (!element) return
    element.trackTitle = title
    element.artist = artist
    element.coverUrl = coverUrl
    element.isShuffled = isShuffled
    element.repeatMode = repeatMode
  }, [artist, coverUrl, element, isShuffled, repeatMode, title])

  useEffect(() => {
    if (!element) return
    element.onShuffleToggle = onShuffleToggle
    element.onRepeatToggle = onRepeatToggle
    element.onNext = onNext
    element.onPrevious = onPrevious
  }, [element, onNext, onPrevious, onRepeatToggle, onShuffleToggle])
}
