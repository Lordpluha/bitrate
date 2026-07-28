import Hls from 'hls.js'
import type { PlayerSlot } from '@/shared/hooks/audioPlayer/audioPlayer.types'
import {
  ACTIVE_BUFFER_SECONDS,
  applyNetworkAwareHlsQuality,
  getHlsUrl,
  PREFETCH_BUFFER_SECONDS,
  savePlaybackPosition,
} from '@/shared/hooks/audioPlayer/audioPlayer.utils'

type AttachHlsSourceOptions = {
  element: HTMLAudioElement
  isPrefetch: boolean
  onFatalError: () => void
  playbackKey: string
  recoveryAttempts: Record<string, number>
  slot: PlayerSlot
  trackId: string
}

const recoverableLoadErrors = new Set([
  Hls.ErrorDetails.MANIFEST_LOAD_ERROR,
  Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT,
  Hls.ErrorDetails.MANIFEST_PARSING_ERROR,
  Hls.ErrorDetails.FRAG_LOAD_ERROR,
  Hls.ErrorDetails.FRAG_LOAD_TIMEOUT,
])

export const attachHlsSource = ({
  element,
  isPrefetch,
  onFatalError,
  playbackKey,
  recoveryAttempts,
  slot,
  trackId,
}: AttachHlsSourceOptions) => {
  const url = getHlsUrl(trackId)

  if (Hls.isSupported()) {
    const hls = new Hls({
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
    slot.hls = hls
    hls.attachMedia(element)
    hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(url))
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      recoveryAttempts[trackId] = 0
      applyNetworkAwareHlsQuality(hls)
    })
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal || slot.hls !== hls) return

      if (recoverableLoadErrors.has(data.details)) {
        savePlaybackPosition(playbackKey, element.currentTime)
        onFatalError()
        return
      }

      const attempts = recoveryAttempts[trackId] ?? 0
      recoveryAttempts[trackId] = attempts + 1

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR && attempts < 3) {
        hls.startLoad(element.currentTime)
        return
      }
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR && attempts < 3) {
        hls.recoverMediaError()
        return
      }

      savePlaybackPosition(playbackKey, element.currentTime)
      onFatalError()
    })
    return
  }

  if (element.canPlayType('application/vnd.apple.mpegurl')) {
    element.src = url
    element.addEventListener('error', onFatalError, { once: true })
    element.load()
    return
  }

  onFatalError()
}
