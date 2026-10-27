'use client'

import { useArtist } from '@entities/Artist'
import {
  selectCurrentPlaylistName,
  selectMusicPlayer,
  selectRepeatMode,
  usePlayerStore,
  useStreamingPlayer,
} from '@entities/Player'
import { useTrackLike } from '@entities/Track'
import { useI18n } from '@shared/i18n'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { useCallback, useEffect } from 'react'
import { useFloatingPlayerWindow } from './useFloatingPlayerWindow'
import { usePlayerElementSync } from './usePlayerElementSync'
import { usePlayerHotkeys } from './usePlayerHotkeys'
import { usePlayerSessionPersistence } from './usePlayerSessionPersistence'
import { usePlaylistShuffle } from './usePlaylistShuffle'
import { useRecordListenedTrack } from './useRecordListenedTrack'
import { useStreamQualityCap } from './useStreamQualityCap'

type UsePlayerControllerInput = {
  isExpanded: boolean
  onExpandedChange: (isExpanded: boolean) => void
}

export const usePlayerController = ({
  isExpanded,
  onExpandedChange,
}: UsePlayerControllerInput) => {
  const { t } = useI18n()
  const player = usePlayerStore(selectMusicPlayer)
  const currentPlaylistName = usePlayerStore(selectCurrentPlaylistName)
  const repeatMode = usePlayerStore(selectRepeatMode)
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const { currentTrack, playlist } = player
  const { data: artist } = useArtist(currentTrack?.artistId)
  useStreamQualityCap()
  const trackLike = useTrackLike(currentTrack?.id)
  const floatingPlayer = useFloatingPlayerWindow(currentTrack?.title)
  const audio = useStreamingPlayer()
  const toggleShuffle = usePlaylistShuffle({
    currentQueueId: player.currentQueueId,
    currentTrack,
    isShuffled: player.isShuffled,
    playlist,
  })
  const isVisible = Boolean(currentTrack)

  const { changeTrack } = audio
  /** Stable, since the playing element is handed them on every change. */
  const playNext = useCallback(() => changeTrack('next'), [changeTrack])
  const playPrevious = useCallback(() => changeTrack('prev'), [changeTrack])

  usePlayerSessionPersistence(player, currentPlaylistName)
  useRecordListenedTrack({
    currentTime: player.currentTime,
    trackId: currentTrack?.id,
  })
  usePlayerHotkeys({
    currentTime: player.currentTime,
    duration: player.duration,
    isEnabled: isVisible,
    onNext: playNext,
    onPrevious: playPrevious,
    onSeek: audio.onSeek,
    onToggleShuffle: toggleShuffle,
    onTogglePlay: audio.togglePlayPause,
    volume: player.volume,
  })

  usePlayerElementSync({
    artist: artist?.username || t('common.unknownArtist'),
    coverUrl: (currentTrack && getTrackCoverUrl(currentTrack.cover)) || '',
    isShuffled: player.isShuffled,
    onNext: playNext,
    onPrevious: playPrevious,
    onRepeatToggle: cycleRepeatMode,
    onShuffleToggle: toggleShuffle,
    repeatMode,
    title: currentTrack?.title || t('common.unknown'),
  })

  useEffect(() => {
    if (!currentTrack) onExpandedChange(false)
  }, [currentTrack, onExpandedChange])

  if (!currentTrack) return null

  const common = {
    artist: artist?.username || t('common.unknownArtist'),
    coverUrl: getTrackCoverUrl(currentTrack.cover),
    isLiked: trackLike.isLiked,
    onLikeToggle: trackLike.toggleLike,
    onNext: playNext,
    onPrevious: playPrevious,
    title: currentTrack.title || t('common.unknown'),
  }

  return {
    elementProps: {
      bindElement: audio.bindElement,
    },
    desktopProps: {
      ...common,
      isVisible,
      onExpand: () => onExpandedChange(true),
      onPictureInPicture: floatingPlayer.open,
      onVolumeChange: setVolume,
      volume: player.volume,
    },
    responsiveProps: {
      ...common,
      floatingWindow: floatingPlayer.targetWindow,
      isExpanded,
      onCloseExpanded: () => onExpandedChange(false),
      onVolumeChange: setVolume,
      playlistTitle: currentPlaylistName || t('common.playlist'),
      volume: player.volume,
    },
  }
}
