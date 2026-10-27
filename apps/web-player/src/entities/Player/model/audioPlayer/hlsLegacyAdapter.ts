import type { BitratePlayerLegacyAdapter } from '@bitrate/player/contract'
import Hls from 'hls.js'
import {
  ACTIVE_BUFFER_SECONDS,
  applyNetworkAwareHlsQuality,
  getHlsUrl,
  PREFETCH_BUFFER_SECONDS,
  savePlaybackPosition,
} from '@/entities/Player/model/audioPlayer/audioPlayer.utils'

/** Fatal hls.js errors that go straight to the progressive file instead of recovering. */
const recoverableLoadErrors = new Set([
  Hls.ErrorDetails.MANIFEST_LOAD_ERROR,
  Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT,
  Hls.ErrorDetails.MANIFEST_PARSING_ERROR,
  Hls.ErrorDetails.FRAG_LOAD_ERROR,
  Hls.ErrorDetails.FRAG_LOAD_TIMEOUT,
])

/** hls.js network/media recoveries per track before falling back to the progressive file. */
const MAX_RECOVERY_ATTEMPTS = 3

/**
 * The legacy chain `<bitrate-player>` hands a track with no CMAF manifest (or no MSE):
 * hls.js, then native HLS, then the progressive file. hls.js stays a web-player dependency —
 * the package never ships it. Recovery attempts are counted per track across plays.
 */
export const createHlsLegacyAdapter = (): BitratePlayerLegacyAdapter => {
  const recoveryAttempts: Record<string, number> = {}

  return ({
    isPrefetch,
    key,
    media,
    onFatalError,
    progressiveUrl,
    trackId,
  }) => {
    let destroyed = false
    let hls: Hls | null = null
    const url = getHlsUrl(trackId)

    const fallBackToProgressive = () => {
      if (destroyed) return

      const resumePosition = media.currentTime
      savePlaybackPosition(key, resumePosition)
      hls?.destroy()
      hls = null
      recoveryAttempts[trackId] = 0

      media.addEventListener(
        'loadedmetadata',
        () => {
          if (
            !destroyed &&
            Number.isFinite(media.duration) &&
            resumePosition > 0 &&
            resumePosition < media.duration
          ) {
            media.currentTime = resumePosition
          }
        },
        { once: true },
      )
      media.addEventListener(
        'error',
        () => {
          if (!destroyed) onFatalError()
        },
        { once: true },
      )
      media.src = progressiveUrl
      media.load()
    }

    const destroy = () => {
      destroyed = true
      hls?.destroy()
      hls = null
    }

    if (Hls.isSupported()) {
      const instance = new Hls({
        autoStartLoad: true,
        backBufferLength: ACTIVE_BUFFER_SECONDS,
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: isPrefetch
          ? PREFETCH_BUFFER_SECONDS
          : ACTIVE_BUFFER_SECONDS,
        maxMaxBufferLength: isPrefetch
          ? PREFETCH_BUFFER_SECONDS
          : ACTIVE_BUFFER_SECONDS,
        startFragPrefetch: false,
        xhrSetup: (xhr) => {
          xhr.withCredentials = true
        },
      })
      hls = instance
      instance.attachMedia(media)
      instance.on(Hls.Events.MEDIA_ATTACHED, () => instance.loadSource(url))
      instance.on(Hls.Events.MANIFEST_PARSED, () => {
        recoveryAttempts[trackId] = 0
        applyNetworkAwareHlsQuality(instance)
      })
      instance.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal || hls !== instance || destroyed) return

        if (recoverableLoadErrors.has(data.details)) {
          fallBackToProgressive()
          return
        }

        const attempts = recoveryAttempts[trackId] ?? 0
        recoveryAttempts[trackId] = attempts + 1

        if (
          data.type === Hls.ErrorTypes.NETWORK_ERROR &&
          attempts < MAX_RECOVERY_ATTEMPTS
        ) {
          instance.startLoad(media.currentTime)
          return
        }
        if (
          data.type === Hls.ErrorTypes.MEDIA_ERROR &&
          attempts < MAX_RECOVERY_ATTEMPTS
        ) {
          instance.recoverMediaError()
          return
        }

        fallBackToProgressive()
      })
      return { destroy }
    }

    if (media.canPlayType('application/vnd.apple.mpegurl')) {
      media.src = url
      media.addEventListener('error', fallBackToProgressive, { once: true })
      media.load()
      return {
        destroy: () => {
          media.removeEventListener('error', fallBackToProgressive)
          destroy()
        },
      }
    }

    fallBackToProgressive()
    return { destroy }
  }
}
