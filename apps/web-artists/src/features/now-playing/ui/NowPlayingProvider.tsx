import {
  BITRATE_PLAYER_EVENT,
  type BitratePlayerElement,
} from '@bitrate/player/contract'
import { useI18n } from '@shared/i18n'
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useBitratePlayerDefined } from '../model/bitratePlayer'
import {
  NowPlayingContext,
  type NowPlayingControls,
  type NowPlayingStatus,
  type NowPlayingTrack,
  type PlaybackTime,
  PlaybackTimeContext,
} from '../model/nowPlaying'
import { readVolume, storeVolume } from '../model/volume'
import { NowPlayingIsland } from './NowPlayingIsland'

/** How often the position is read while audio plays; the element reports no time events. */
const TICK_MS = 250

/** The `message` of an `error` event's detail, when it has one. */
function errorMessage(event: Event): string | null {
  const detail: unknown = event instanceof CustomEvent ? event.detail : null
  return detail &&
    typeof detail === 'object' &&
    'message' in detail &&
    typeof detail.message === 'string'
    ? detail.message
    : null
}

/**
 * One headless `<bitrate-player>` for the whole workspace, so playback survives navigation and
 * only one recording is audible. Rows and the catalogue start recordings through
 * {@link useNowPlaying}; the floating island shows and controls what plays.
 */
export function NowPlayingProvider({ children }: PropsWithChildren) {
  const { t, tMessage } = useI18n()
  const defined = useBitratePlayerDefined()
  const root = useRef<BitratePlayerElement>(null)
  const currentRef = useRef<NowPlayingTrack | null>(null)
  const [current, setCurrent] = useState<NowPlayingTrack | null>(null)
  const [status, setStatus] = useState<NowPlayingStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [time, setTime] = useState<PlaybackTime>({
    currentTime: 0,
    duration: 0,
  })
  const [volume, setVolumeState] = useState(1)
  const [muted, setMuted] = useState(false)

  useEffect(() => setVolumeState(readVolume()), [])

  useEffect(() => {
    const element = root.current
    if (!defined || !element) return
    element.mediaSession = true
    let timer: number | undefined
    const read = () => {
      const { currentTime, duration } = element.state
      setTime({ currentTime, duration })
    }
    const stopTicking = () => {
      window.clearInterval(timer)
      read()
    }
    const onPlay = () => {
      setStatus('playing')
      setError(null)
      window.clearInterval(timer)
      read()
      timer = window.setInterval(read, TICK_MS)
    }
    const onPause = () => {
      setStatus('paused')
      stopTicking()
    }
    const onError = (event: Event) => {
      setStatus('error')
      setError(errorMessage(event) ?? t('music.preview.failed'))
      stopTicking()
    }
    element.addEventListener(BITRATE_PLAYER_EVENT.PLAY, onPlay)
    element.addEventListener(BITRATE_PLAYER_EVENT.PAUSE, onPause)
    element.addEventListener(BITRATE_PLAYER_EVENT.ENDED, onPause)
    element.addEventListener(BITRATE_PLAYER_EVENT.ERROR, onError)
    return () => {
      window.clearInterval(timer)
      element.removeEventListener(BITRATE_PLAYER_EVENT.PLAY, onPlay)
      element.removeEventListener(BITRATE_PLAYER_EVENT.PAUSE, onPause)
      element.removeEventListener(BITRATE_PLAYER_EVENT.ENDED, onPause)
      element.removeEventListener(BITRATE_PLAYER_EVENT.ERROR, onError)
    }
  }, [defined, t])

  useEffect(() => {
    const element = root.current
    if (!defined || !element) return
    element.volume = volume
    element.muted = muted
  }, [defined, volume, muted])

  const toggle = useCallback(
    (track: NowPlayingTrack) => {
      const element = root.current
      if (!element) return
      if (currentRef.current?.key === track.key) {
        if (element.state.status === 'playing') element.pause()
        else void element.play().catch(() => undefined)
        return
      }
      element.trackTitle = track.title
      element.artist = track.subtitle ?? ''
      element.coverUrl = track.coverUrl ?? ''
      // Owned masters are served as uploaded, so there is a single quality to offer.
      element.renditions = [{ bitrate: 0, label: t('release.master') }]
      element.resolveSource = () =>
        track.resolve().catch((cause: unknown) => {
          throw new Error(
            tMessage(cause instanceof Error ? cause.message : undefined),
            { cause },
          )
        })
      currentRef.current = track
      setCurrent(track)
      setStatus('loading')
      setError(null)
      setTime({ currentTime: 0, duration: 0 })
      // The element rebuilds its engine in an effect after the resolver changes.
      window.setTimeout(() => {
        if (currentRef.current?.key === track.key)
          void element.play().catch(() => undefined)
      }, 0)
    },
    [t, tMessage],
  )

  const controls = useMemo<NowPlayingControls>(
    () => ({
      current,
      status,
      error,
      volume,
      muted,
      toggle,
      seek: (seconds) => {
        root.current?.seek(seconds)
        setTime((previous) => ({ ...previous, currentTime: seconds }))
      },
      setVolume: (level) => {
        if (level === 0) {
          setMuted(true)
          return
        }
        setVolumeState(level)
        setMuted(false)
        storeVolume(level)
      },
      toggleMute: () => setMuted((value) => !value),
      close: () => {
        const element = root.current
        element?.pause()
        if (element) element.resolveSource = null
        currentRef.current = null
        setCurrent(null)
        setStatus('idle')
        setError(null)
      },
    }),
    [current, status, error, volume, muted, toggle],
  )

  return (
    <NowPlayingContext.Provider value={controls}>
      <PlaybackTimeContext.Provider value={time}>
        {children}
        {defined && <bitrate-player chrome="none" hidden ref={root} />}
        <NowPlayingIsland />
      </PlaybackTimeContext.Provider>
    </NowPlayingContext.Provider>
  )
}
