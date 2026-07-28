'use client'

import {
  selectCurrentPlaylistName,
  selectMusicPlayer,
  usePlayerStore,
} from '@entities/Player'
import { useLikeTrack, useUnlikeTrack } from '@entities/Track/api/client'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { showApiSuccessToast } from '@shared/api/feedback'
import { useAudioPlayer } from '@shared/hooks'
import { useArtist } from '@shared/hooks/useArtist'
import { useLikedTracks } from '@shared/hooks/useLikedTracks'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FloatingPlayerWindow } from './FloatingPlayerWindow'
import { MiniPlayer } from './MiniPlayer'
import { NowPlayingView } from './NowPlayingView'
import { PlayerActions } from './PlayerActions'
import { PlayerControls } from './PlayerControls'
import { TrackInfo } from './TrackInfo'

const PLAYER_SESSION_STORAGE_KEY = 'spotify:last-player-session'
const PLAYER_SESSION_PERSIST_INTERVAL_MS = 5000

type PersistedPlayerSession = {
  currentPlaylistId: string | null
  currentPlaylistName: string | null
  currentTime: number
  currentTrack: TrackEntity
  currentTrackIndex: number
  duration: number
  playlist: TrackEntity[]
  progress: number
  volume: number
}

export const Player = () => {
  const {
    currentTrack,
    currentPlaylistId,
    isPlaying,
    currentTrackIndex,
    volume,
    currentTime,
    duration,
    isShuffled,
    playlist,
    progress,
  } = usePlayerStore(selectMusicPlayer)
  const currentPlaylistName = usePlayerStore(selectCurrentPlaylistName)
  const restorePlayerSession = usePlayerStore(
    (state) => state.restorePlayerSession,
  )
  const setPlaylistTracks = usePlayerStore((state) => state.setPlaylistTracks)
  const setShuffleEnabled = usePlayerStore((state) => state.setShuffleEnabled)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [floatingWindow, setFloatingWindow] = useState<Window | null>(null)
  const lastPersistedAtRef = useRef(0)
  const lastPersistedTrackIdRef = useRef<string | null>(null)
  const originalPlaylistRef = useRef<TrackEntity[]>([])
  const { data: artist } = useArtist(currentTrack?.artistId)
  const { data: likedTracks } = useLikedTracks()
  const likeTrack = useLikeTrack()
  const unlikeTrack = useUnlikeTrack()
  const artistName = artist?.username || 'Unknown Artist'
  const likedTrackIds = useMemo(
    () => new Set(likedTracks?.map((track) => track.id) ?? []),
    [likedTracks],
  )
  const isCurrentTrackLiked = currentTrack
    ? likedTrackIds.has(currentTrack.id)
    : false
  const isLikePending = likeTrack.isPending || unlikeTrack.isPending

  const {
    activeSlot,
    bindAudioElement,
    togglePlayPause,
    onSeek,
    changeTrack,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleProgress,
    handleCanPlay,
    handlePlaybackStateChange,
    handleEnded,
    handleSeeked,
  } = useAudioPlayer()

  useEffect(() => {
    if (currentTrack || typeof window === 'undefined') return

    try {
      const rawSession = window.localStorage.getItem(PLAYER_SESSION_STORAGE_KEY)
      if (!rawSession) return

      const session = JSON.parse(rawSession) as PersistedPlayerSession
      if (!session.currentTrack?.id) return

      restorePlayerSession(session)
    } catch {
      window.localStorage.removeItem(PLAYER_SESSION_STORAGE_KEY)
    }
  }, [currentTrack, restorePlayerSession])

  useEffect(() => {
    if (!currentTrack || typeof window === 'undefined') return
    const now = Date.now()
    const hasTrackChanged = lastPersistedTrackIdRef.current !== currentTrack.id

    if (
      !hasTrackChanged &&
      now - lastPersistedAtRef.current < PLAYER_SESSION_PERSIST_INTERVAL_MS
    ) {
      return
    }

    const session: PersistedPlayerSession = {
      currentPlaylistId,
      currentPlaylistName,
      currentTime,
      currentTrack,
      currentTrackIndex,
      duration,
      playlist,
      progress,
      volume,
    }

    window.localStorage.setItem(
      PLAYER_SESSION_STORAGE_KEY,
      JSON.stringify(session),
    )
    lastPersistedAtRef.current = now
    lastPersistedTrackIdRef.current = currentTrack.id
  }, [
    currentPlaylistName,
    currentPlaylistId,
    currentTime,
    currentTrack,
    currentTrackIndex,
    duration,
    playlist,
    progress,
    volume,
  ])

  useEffect(() => {
    if (currentTrack) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
      setIsExpanded(false)
    }
  }, [currentTrack])

  useEffect(() => {
    if (!isShuffled) {
      originalPlaylistRef.current = playlist
    }
  }, [isShuffled, playlist])

  const coverUrl = getTrackCoverUrl(currentTrack?.cover)

  const handleLikeToggle = useCallback(async () => {
    if (!currentTrack || isLikePending) return

    if (isCurrentTrackLiked) {
      await unlikeTrack.mutateAsync({
        params: {
          path: {
            id: currentTrack.id,
          },
        },
      })
      showApiSuccessToast('Removed from Liked Songs')
      return
    }

    await likeTrack.mutateAsync({
      params: {
        path: {
          id: currentTrack.id,
        },
      },
    })
    showApiSuccessToast('Added to Liked Songs')
  }, [currentTrack, isCurrentTrackLiked, isLikePending, likeTrack, unlikeTrack])

  const handleShuffleToggle = useCallback(() => {
    if (!currentTrack) return

    if (playlist.length < 2) {
      setShuffleEnabled(!isShuffled)
      return
    }

    if (isShuffled) {
      const originalPlaylist = originalPlaylistRef.current
      if (originalPlaylist.length > 0) {
        setPlaylistTracks(originalPlaylist)
      }
      setShuffleEnabled(false)
      return
    }

    originalPlaylistRef.current = playlist
    const remainingTracks = playlist.filter(
      (track) => track.id !== currentTrack.id,
    )
    const shuffledTracks = [...remainingTracks]

    for (let index = shuffledTracks.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1))
      const current = shuffledTracks[index]
      const randomTrack = shuffledTracks[randomIndex]

      if (!current || !randomTrack) continue

      shuffledTracks[index] = randomTrack
      shuffledTracks[randomIndex] = current
    }

    setPlaylistTracks([currentTrack, ...shuffledTracks])
    setShuffleEnabled(true)
  }, [currentTrack, isShuffled, playlist, setPlaylistTracks, setShuffleEnabled])

  const closeFloatingPlayer = useCallback(() => {
    if (floatingWindow && !floatingWindow.closed) {
      floatingWindow.close()
    }
    setFloatingWindow(null)
  }, [floatingWindow])

  const openFloatingPlayer = useCallback(async () => {
    if (!currentTrack) return

    if (floatingWindow && !floatingWindow.closed) {
      floatingWindow.focus()
      return
    }

    type DocumentPictureInPictureWindow = Window & {
      documentPictureInPicture?: {
        requestWindow: (options?: {
          width?: number
          height?: number
        }) => Promise<Window>
      }
    }

    const currentWindow = window as DocumentPictureInPictureWindow
    const nextWindow = currentWindow.documentPictureInPicture
      ? await currentWindow.documentPictureInPicture.requestWindow({
          height: 140,
          width: 380,
        })
      : window.open('', 'spotify-floating-player', 'popup,width=380,height=140')

    if (!nextWindow) return

    nextWindow.document.title = `${currentTrack.title} - Spotify`
    nextWindow.addEventListener('pagehide', () => setFloatingWindow(null), {
      once: true,
    })
    setFloatingWindow(nextWindow)
  }, [currentTrack, floatingWindow])

  if (!currentTrack) {
    return null
  }

  return (
    <>
      {([0, 1] as const).map((slot) => (
        // biome-ignore lint/a11y/useMediaCaption: this element plays audio-only music
        <audio
          data-active={activeSlot === slot}
          key={slot}
          onCanPlay={() => handleCanPlay(slot)}
          onEnded={() => handleEnded(slot)}
          onLoadedMetadata={() => handleLoadedMetadata(slot)}
          onPause={() => handlePlaybackStateChange(slot, false)}
          onPlay={() => handlePlaybackStateChange(slot, true)}
          onProgress={() => handleProgress(slot)}
          onSeeked={handleSeeked}
          onTimeUpdate={() => handleTimeUpdate(slot)}
          preload="auto"
          ref={(element) => bindAudioElement(slot, element)}
        />
      ))}

      <FloatingPlayerWindow
        artist={artistName}
        coverUrl={coverUrl}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onClose={closeFloatingPlayer}
        onNext={() => changeTrack('next')}
        onPlayPause={togglePlayPause}
        onPrevious={() => changeTrack('prev')}
        onSeek={onSeek}
        targetWindow={floatingWindow}
        title={currentTrack.title || 'Unknown'}
      />

      <NowPlayingView
        artist={artistName}
        coverUrl={coverUrl}
        currentTime={currentTime}
        duration={duration}
        isLiked={isCurrentTrackLiked}
        isOpen={isExpanded}
        isPlaying={isPlaying}
        onClose={() => setIsExpanded(false)}
        onLikeToggle={() => void handleLikeToggle()}
        onNext={() => changeTrack('next')}
        onPlayPause={togglePlayPause}
        onPrevious={() => changeTrack('prev')}
        onSeek={onSeek}
        onVolumeChange={setVolume}
        playlistTitle={currentPlaylistName || 'Playlist'}
        title={currentTrack.title || 'Unknown'}
        volume={volume}
      />

      <MiniPlayer
        artist={artistName}
        coverUrl={coverUrl}
        currentTime={currentTime}
        duration={duration}
        isLiked={isCurrentTrackLiked}
        isPlaying={isPlaying}
        isVisible={isVisible}
        onExpand={() => setIsExpanded(true)}
        onLikeToggle={() => void handleLikeToggle()}
        onNext={() => changeTrack('next')}
        onPlayPause={togglePlayPause}
        title={currentTrack.title || 'Unknown'}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 h-22.5 bg-background border-t border-border px-4 hidden [@media(min-width:1025px)]:flex items-center justify-between gap-4 z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-[25%]">
          <TrackInfo
            artist={artistName}
            coverUrl={coverUrl}
            isLiked={isCurrentTrackLiked}
            onLikeToggle={() => void handleLikeToggle()}
            onPictureInPicture={openFloatingPlayer}
            title={currentTrack.title || 'Unknown'}
          />
        </div>

        <div className="w-[40%] flex justify-center">
          <PlayerControls
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            isShuffled={isShuffled}
            onNext={() => changeTrack('next')}
            onPlayPause={togglePlayPause}
            onPrevious={() => changeTrack('prev')}
            onSeek={onSeek}
            onShuffleToggle={handleShuffleToggle}
          />
        </div>

        <div className="w-[35%] flex justify-end">
          <PlayerActions
            onExpand={() => setIsExpanded(true)}
            onVolumeChange={setVolume}
            volume={volume}
          />
        </div>
      </div>
    </>
  )
}
