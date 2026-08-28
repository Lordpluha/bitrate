import { fetchRenditionRange } from '@/entities/Player/api/client'
import {
  canPlayThroughMse,
  playerLog,
  StreamLoader,
} from '@/entities/Player/lib'
import type { PlayerSlot } from '@/entities/Player/model/audioPlayer/audioPlayer.types'
import type { TrackManifest } from '@/entities/Player/model/manifest.types'

export type AttachCmafSourceInput = {
  element: HTMLAudioElement
  isPrefetch: boolean
  manifest: TrackManifest
  playbackKey: string
  slot: PlayerSlot
  trackId: string
  onFatalError: () => void
}

/** Buffer target for the track being listened to. */
export const ACTIVE_BUFFER_SECONDS = 30

/**
 * The next track only needs enough to start instantly. Prefetching a full
 * window would compete for bandwidth with the track actually playing.
 */
export const PREFETCH_BUFFER_SECONDS = 8

/**
 * Attaches the single-file CMAF path to a slot: a MediaSource driven by our own
 * loader, one fragment at a time. Returns false when this browser cannot use
 * MSE, so the caller can fall back to the existing HLS/progressive path.
 * See ADR-0020.
 */
export const attachCmafSource = ({
  element,
  isPrefetch,
  manifest,
  playbackKey,
  slot,
  trackId,
  onFatalError,
}: AttachCmafSourceInput): boolean => {
  if (!canPlayThroughMse(manifest)) {
    playerLog('path', 'MSE недоступен → откат на HLS', { trackId })
    return false
  }

  playerLog('path', `CMAF${isPrefetch ? ' (префетч следующего трека)' : ''}`, {
    рендиции: manifest.renditions.map((r) => `${r.bitrate}k`).join(', '),
    фрагментов: manifest.renditions[0]?.fragments.length ?? 0,
    длительность: `${(manifest.durationTicks / manifest.timescale).toFixed(1)} с`,
    trackId,
  })

  const loader = new StreamLoader({
    audio: element,
    label: isPrefetch ? 'префетч' : 'актив',
    manifest,
    targetBufferSeconds: isPrefetch
      ? PREFETCH_BUFFER_SECONDS
      : ACTIVE_BUFFER_SECONDS,
    fetchRange: ({ bitrate, range, signal }) => {
      const rendition = manifest.renditions.find(
        (candidate) => candidate.bitrate === bitrate,
      )
      if (!rendition) {
        return Promise.reject(
          new Error(`Unknown rendition bitrate: ${bitrate}`),
        )
      }

      return fetchRenditionRange({
        bitrate,
        expectedSize: rendition.size,
        range,
        signal,
        trackId,
      })
    },
    onBitrateChange: (bitrate) => {
      slot.currentBitrate = bitrate
    },
    onError: (error) => {
      playerLog('error', `загрузчик упал: ${error.message}`, { trackId })
      /** A failed load must not leave the slot silently stuck. */
      if (slot.loader === loader && slot.playbackKey === playbackKey) {
        onFatalError()
      }
    },
    onUnsupported: onFatalError,
  })

  slot.loader = loader
  void loader.start().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    playerLog('error', `загрузчик не запустился: ${message}`, { trackId })
    if (slot.loader === loader && slot.playbackKey === playbackKey) {
      onFatalError()
    }
  })

  return true
}
