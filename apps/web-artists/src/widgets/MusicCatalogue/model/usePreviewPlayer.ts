import type { MusicTrack } from '@entities/music'
import { playableAudioUrl, releaseAudioUrl } from '@entities/release'
import { messageKey } from '@shared/i18n'
import { useEffect, useRef, useState } from 'react'

/** The listener's preview volume, remembered in this browser. */
const VOLUME_STORAGE_KEY = 'bitrate.artist-preview-volume.v1'

function readVolume() {
  try {
    const stored = Number(localStorage.getItem(VOLUME_STORAGE_KEY))
    return Number.isFinite(stored) && stored > 0 && stored <= 1 ? stored : 1
  } catch {
    return 1
  }
}

/** Whether a row can play: a sample/preview URL, or an uploaded master inside a release. */
export function canPreview(track: MusicTrack) {
  return Boolean(track.previewUrl || track.release)
}

/**
 * One shared preview `<audio>`: plays, pauses and reports failures for the chosen track.
 * Demo rows play their preview URL; uploaded recordings play their private master, checked
 * first so an expired session is renewed before `<audio>` asks for it. `playError` is a
 * catalog key.
 */
export function usePreviewPlayer() {
  const [active, setActive] = useState<MusicTrack | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [playError, setPlayError] = useState<string | null>(null)
  /** Playback position and length in seconds, read from the `<audio>` element. */
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  /** 0–1; muting keeps the level so unmuting restores it. */
  const [volume, setVolumeState] = useState(1)
  const [muted, setMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  // The track whose master is being resolved; a later choice wins over an earlier one.
  const requested = useRef<string | null>(null)

  useEffect(() => {
    setVolumeState(readVolume())
  }, [])

  // Live changes to the level; a new track's element takes it on load (see audioEvents).
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    audio.muted = muted
  }, [volume, muted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    let current = true
    // The element is recreated per track, and two tracks may share one preview URL, so the
    // chosen track is part of what starts playback.
    if (playing && source && active) {
      void audio.play().catch(() => {
        if (!current) return
        setPlaying(false)
        setPlayError(messageKey('music.preview.failed'))
      })
    } else audio.pause()
    return () => {
      current = false
      audio.pause()
    }
  }, [playing, source, active])

  const start = async (track: MusicTrack) => {
    requested.current = track.id
    setActive(track)
    setPlaying(false)
    setTime(0)
    setDuration(0)
    if (track.previewUrl) {
      setSource(track.previewUrl)
      setPlaying(true)
      return
    }
    if (!track.release) return
    setSource(null)
    try {
      const url = await playableAudioUrl(
        releaseAudioUrl(track.release.id, track.id),
      )
      if (requested.current !== track.id) return
      setSource(url)
      setPlaying(true)
    } catch (error) {
      if (requested.current !== track.id) return
      setPlayError(
        error instanceof Error
          ? error.message
          : messageKey('music.preview.failed'),
      )
    }
  }

  /** Starts the track, or pauses it when it is the one already chosen. */
  const toggle = (track: MusicTrack) => {
    setPlayError(null)
    if (active?.id === track.id && source) {
      setPlaying(!playing)
      return
    }
    void start(track)
  }
  const stop = () => setPlaying(false)
  const fail = () => {
    setPlaying(false)
    setPlayError(messageKey('music.preview.unavailable'))
  }
  /** Jumps to `seconds` within the current track. */
  const seek = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = seconds
    setTime(seconds)
  }
  /**
   * Sets the level from 0 to 1. Dragging to 0 mutes and keeps the last level, so unmuting
   * brings the sound back; any other level unmutes and is remembered.
   */
  const setVolume = (level: number) => {
    if (level === 0) {
      setMuted(true)
      return
    }
    setVolumeState(level)
    setMuted(false)
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(level))
    } catch {
      // The level still applies for this visit when storage is unavailable.
    }
  }
  const toggleMute = () => setMuted((value) => !value)
  /** Stops playback and hides the player. */
  const close = () => {
    requested.current = null
    setPlaying(false)
    setActive(null)
    setSource(null)
  }
  /** Handlers for the shared `<audio>` element. */
  const audioEvents = {
    // Each track gets a fresh element, which starts at full volume until told otherwise.
    onLoadedMetadata: () => {
      const audio = audioRef.current
      if (!audio) return
      audio.volume = volume
      audio.muted = muted
    },
    onTimeUpdate: () => setTime(audioRef.current?.currentTime ?? 0),
    onDurationChange: () => {
      const length = audioRef.current?.duration ?? 0
      setDuration(Number.isFinite(length) ? length : 0)
    },
  }

  return {
    active,
    source,
    playing,
    playError,
    time,
    duration,
    volume,
    muted,
    audioRef,
    audioEvents,
    toggle,
    stop,
    fail,
    seek,
    close,
    setVolume,
    toggleMute,
  }
}
