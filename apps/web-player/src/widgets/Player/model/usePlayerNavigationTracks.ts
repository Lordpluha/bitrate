'use client'

import {
  type PlayerState,
  resolvePlaybackTransition,
  selectCurrentQueueId,
  selectCurrentTrack,
  selectCurrentTrackIndex,
  selectPlaybackSequence,
  selectPlaylist,
  selectQueue,
  selectRepeatMode,
  usePlayerStore,
} from '@/entities/Player'

interface PlayerNavigationTracks {
  nextTrack: PlayerState['currentTrack']
  previousTrack: PlayerState['currentTrack']
}

export const usePlayerNavigationTracks = (): PlayerNavigationTracks => {
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const currentTrackIndex = usePlayerStore(selectCurrentTrackIndex)
  const currentQueueId = usePlayerStore(selectCurrentQueueId)
  const playbackSequence = usePlayerStore(selectPlaybackSequence)
  const playlist = usePlayerStore(selectPlaylist)
  const queue = usePlayerStore(selectQueue)
  const repeatMode = usePlayerStore(selectRepeatMode)

  const state = {
    currentQueueId,
    currentTrack,
    currentTrackIndex,
    playbackSequence,
    playlist,
    queue,
    repeatMode,
  }
  const next = resolvePlaybackTransition(state, 'next')
  const previous = resolvePlaybackTransition(state, 'prev')

  return {
    nextTrack: next?.kind === 'track' ? next.track : null,
    previousTrack: previous?.kind === 'track' ? previous.track : null,
  }
}
