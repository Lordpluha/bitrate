'use client'

import { useArtist } from '@entities/Artist'
import {
  selectCurrentPlaylistName,
  selectMusicPlayer,
  selectRepeatMode,
  useAudioPlayer,
  usePlayerStore,
} from '@entities/Player'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { useEffect } from 'react'
import { useCurrentTrackLike } from './useCurrentTrackLike'
import { useFloatingPlayerWindow } from './useFloatingPlayerWindow'
import { usePlayerHotkeys } from './usePlayerHotkeys'
import { usePlayerSessionPersistence } from './usePlayerSessionPersistence'
import { usePlaylistShuffle } from './usePlaylistShuffle'
import { useRecordListenedTrack } from './useRecordListenedTrack'

type UsePlayerControllerInput = {
  isExpanded: boolean
  onExpandedChange: (isExpanded: boolean) => void
}

export const usePlayerController = ({
  isExpanded,
  onExpandedChange,
}: UsePlayerControllerInput) => {
  const player = usePlayerStore(selectMusicPlayer)
  const currentPlaylistName = usePlayerStore(selectCurrentPlaylistName)
  const repeatMode = usePlayerStore(selectRepeatMode)
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const { currentTrack, playlist } = player
  const { data: artist } = useArtist(currentTrack?.artistId)
  const trackLike = useCurrentTrackLike(currentTrack?.id)
  const floatingPlayer = useFloatingPlayerWindow(currentTrack?.title)
  const audio = useAudioPlayer()
  const toggleShuffle = usePlaylistShuffle({
    currentQueueId: player.currentQueueId,
    currentTrack,
    isShuffled: player.isShuffled,
    playlist,
  })
  const isVisible = Boolean(currentTrack)

  usePlayerSessionPersistence(player, currentPlaylistName)
  useRecordListenedTrack({
    currentTime: player.currentTime,
    trackId: currentTrack?.id,
  })
  usePlayerHotkeys({
    currentTime: player.currentTime,
    duration: player.duration,
    isEnabled: isVisible,
    onNext: () => audio.changeTrack('next'),
    onPrevious: () => audio.changeTrack('prev'),
    onSeek: audio.onSeek,
    onToggleShuffle: toggleShuffle,
    onTogglePlay: audio.togglePlayPause,
    volume: player.volume,
  })

  useEffect(() => {
    if (!currentTrack) onExpandedChange(false)
  }, [currentTrack, onExpandedChange])

  if (!currentTrack) return null

  const common = {
    artist: artist?.username || 'Unknown Artist',
    coverUrl: getTrackCoverUrl(currentTrack.cover),
    currentTime: player.currentTime,
    duration: player.duration,
    isLiked: trackLike.isLiked,
    isPlaying: player.isPlaying,
    onLikeToggle: () => void trackLike.toggleLike(),
    onNext: () => audio.changeTrack('next'),
    onPlayPause: audio.togglePlayPause,
    onPrevious: () => audio.changeTrack('prev'),
    title: currentTrack.title || 'Unknown',
  }

  return {
    audioProps: {
      activeSlot: audio.activeSlot,
      bindAudioElement: audio.bindAudioElement,
      onCanPlay: audio.handleCanPlay,
      onEnded: audio.handleEnded,
      onLoadedMetadata: audio.handleLoadedMetadata,
      onPlaybackStateChange: audio.handlePlaybackStateChange,
      onProgress: audio.handleProgress,
      onSeeked: audio.handleSeeked,
      onTimeUpdate: audio.handleTimeUpdate,
    },
    desktopProps: {
      ...common,
      isShuffled: player.isShuffled,
      isVisible,
      onExpand: () => onExpandedChange(true),
      onPictureInPicture: floatingPlayer.open,
      onRepeatToggle: cycleRepeatMode,
      onSeek: audio.onSeek,
      onShuffleToggle: toggleShuffle,
      onVolumeChange: setVolume,
      repeatMode,
      volume: player.volume,
    },
    responsiveProps: {
      ...common,
      floatingWindow: floatingPlayer.targetWindow,
      isExpanded,
      onCloseExpanded: () => onExpandedChange(false),
      onCloseFloating: floatingPlayer.close,
      onExpand: () => onExpandedChange(true),
      onSeek: audio.onSeek,
      onVolumeChange: setVolume,
      playlistTitle: currentPlaylistName || 'Playlist',
      volume: player.volume,
    },
  }
}
