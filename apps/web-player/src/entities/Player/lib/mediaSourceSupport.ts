import type { TrackManifest } from '@/entities/Player/model/manifest.types'

/** The MSE MIME string for one rendition codec. */
const mimeFor = (codec: string) => `audio/mp4; codecs="${codec}"`

/**
 * Resolves once the MediaSource is open, or rejects if it closes or times out.
 *
 * An aborted wait resolves rather than rejects: the loader was torn down, which
 * is not a playback failure.
 */
export const waitForMediaSourceOpen = (
  mediaSource: MediaSource,
  signal: AbortSignal,
  timeoutMs: number,
) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      resolve()
      return
    }
    if (mediaSource.readyState === 'open') {
      resolve()
      return
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const cleanup = () => {
      if (timeoutId !== null) clearTimeout(timeoutId)
      mediaSource.removeEventListener('sourceopen', handleOpen)
      mediaSource.removeEventListener('sourceclose', handleClose)
      signal.removeEventListener('abort', handleAbort)
    }
    const handleOpen = () => {
      cleanup()
      resolve()
    }
    const handleClose = () => {
      cleanup()
      reject(new Error('MediaSource closed before it opened'))
    }
    const handleAbort = () => {
      cleanup()
      resolve()
    }

    mediaSource.addEventListener('sourceopen', handleOpen, { once: true })
    mediaSource.addEventListener('sourceclose', handleClose, { once: true })
    signal.addEventListener('abort', handleAbort, { once: true })
    timeoutId = setTimeout(() => {
      cleanup()
      reject(new Error('Timed out while opening MediaSource'))
    }, timeoutMs)
  })

/** True when this browser can play the manifest through MSE. */
export const canPlayThroughMse = (manifest: TrackManifest): boolean => {
  if (typeof MediaSource === 'undefined') return false

  return manifest.renditions.every((rendition) =>
    MediaSource.isTypeSupported(mimeFor(rendition.codec)),
  )
}

/** A MediaSource attached to an audio element, plus the URL that binds them. */
export type AttachedMediaSource = {
  mediaSource: MediaSource
  objectUrl: string
}

/** What opening the audio SourceBuffer requires. */
export type OpenSourceBufferInput = {
  mediaSource: MediaSource
  manifest: TrackManifest
  /** Codec of the rendition the first fragments will use. */
  codec: string
}

/** Creates a MediaSource and points the audio element at it. */
export const attachMediaSource = (
  audio: HTMLAudioElement,
): AttachedMediaSource => {
  const mediaSource = new MediaSource()
  const objectUrl = URL.createObjectURL(mediaSource)
  audio.src = objectUrl

  return { mediaSource, objectUrl }
}

/**
 * Opens the single audio SourceBuffer and declares the track's duration.
 *
 * The duration is set explicitly and derived from ticks rather than `durationMs`:
 * without it the element derives `seekable` from what is already buffered, and
 * any seek past the buffer is silently clamped.
 */
export const openAudioSourceBuffer = ({
  mediaSource,
  manifest,
  codec,
}: OpenSourceBufferInput): SourceBuffer => {
  const sourceBuffer = mediaSource.addSourceBuffer(mimeFor(codec))
  sourceBuffer.mode = 'segments'

  const durationSeconds = manifest.durationTicks / manifest.timescale
  if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
    mediaSource.duration = durationSeconds
  }

  return sourceBuffer
}
