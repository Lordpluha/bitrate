import { AdaptiveBitrateController } from '@/entities/Player/lib/adaptiveBitrate'
import {
  findFragmentIndexForSeek,
  getBufferedAhead,
  isTimeRangeBuffered,
  resolveFragment,
  selectRendition,
  toRangeHeader,
} from '@/entities/Player/lib/fragmentIndex'
import { logFragment, mbps, playerLog } from '@/entities/Player/lib/playerLog'
import { SourceBufferQueue } from '@/entities/Player/lib/sourceBufferQueue'
import {
  pickStartBitrate,
  readRememberedThroughput,
  rememberThroughput,
} from '@/entities/Player/lib/throughputMemory'
import type { TrackManifest } from '@/entities/Player/model/manifest.types'

export type FetchRangeInput = {
  bitrate: number
  range: readonly [number, number]
  signal: AbortSignal
}

export type StreamLoaderInput = {
  audio: HTMLAudioElement
  manifest: TrackManifest
  /** Issues one ranged request; injected so the loader stays transport-agnostic. */
  fetchRange: (input: FetchRangeInput) => Promise<ArrayBuffer>
  /** Short tag identifying this loader in the console, e.g. "актив". */
  label?: string
  /** Bitrate to start from before any throughput is known. */
  initialBitrate?: number
  /** Seconds of media to keep ahead of the play head. */
  targetBufferSeconds?: number
  /** Called when MSE cannot be used and the caller should fall back to native playback. */
  onUnsupported?: () => void
  onError?: (error: Error) => void
  onBitrateChange?: (bitrate: number) => void
  /** Override only for deterministic tests or unusually constrained clients. */
  maxRequestAttempts?: number
  requestTimeoutMs?: number
  retryBaseDelayMs?: number
  sourceOpenTimeoutMs?: number
}

const DEFAULT_TARGET_BUFFER_SECONDS = 30
const DEFAULT_MAX_REQUEST_ATTEMPTS = 3
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000
const DEFAULT_RETRY_BASE_DELAY_MS = 200
const DEFAULT_SOURCE_OPEN_TIMEOUT_MS = 10_000

/** How often the fill loop re-checks the buffer. */
const FILL_TICK_MS = 250

const mimeFor = (codec: string) => `audio/mp4; codecs="${codec}"`

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error))

const getErrorStatus = (error: unknown) => {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return null
  }

  const { status } = error
  return typeof status === 'number' ? status : null
}

const isRetryableRequestError = (error: unknown) => {
  const status = getErrorStatus(error)
  return status === null || status === 408 || status === 429 || status >= 500
}

const positiveFiniteOr = (value: number | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback

const nonNegativeFiniteOr = (value: number | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fallback

const waitForRetry = (delayMs: number, signal: AbortSignal) =>
  new Promise<boolean>((resolve) => {
    if (signal.aborted) {
      resolve(false)
      return
    }
    if (delayMs <= 0) {
      resolve(true)
      return
    }

    const handleAbort = () => {
      clearTimeout(timeoutId)
      resolve(false)
    }
    const timeoutId = setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve(true)
    }, delayMs)
    signal.addEventListener('abort', handleAbort, { once: true })
  })

const waitForMediaSourceOpen = (
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

/**
 * Drives playback by pulling one fragment at a time into a single `SourceBuffer`.
 *
 * The buffer target, the request timing and the quality of the next fragment are
 * all decided here rather than by the browser, which is the whole point of the
 * byte-range design. See ADR-0020.
 */
export class StreamLoader {
  private readonly input: StreamLoaderInput
  private readonly abr = new AdaptiveBitrateController()
  private mediaSource: MediaSource | null = null
  private queue: SourceBufferQueue | null = null
  private objectUrl: string | null = null
  private controller: AbortController | null = null
  private readonly lifecycleController = new AbortController()

  private currentBitrate: number
  private automaticBitrate = true
  private appendedInitFor: number | null = null
  private nextFragmentIndex = 0
  private hadStall = false
  private fillTimer: ReturnType<typeof setInterval> | null = null
  private filling = false
  /** Resolves when the running fill loop unwinds; lets a seek restart at once. */
  private fillPromise: Promise<void> = Promise.resolve()
  private targetBufferSeconds: number
  private label: string
  private destroyed = false
  /**
   * Bumped by every seek. A fill loop compares it after each await and stops if
   * it is stale, so a seek is never overwritten by the download it interrupted.
   */
  private epoch = 0

  constructor(input: StreamLoaderInput) {
    this.input = input

    const remembered = readRememberedThroughput()
    if (remembered !== null) this.abr.seed(remembered)

    this.currentBitrate =
      input.initialBitrate ??
      pickStartBitrate({
        manifest: input.manifest,
        throughputBps: remembered,
      }) ??
      0
    this.targetBufferSeconds =
      input.targetBufferSeconds ?? DEFAULT_TARGET_BUFFER_SECONDS
    this.label = input.label ?? 'плеер'
  }

  /**
   * Marks this loader as playing the track the user actually hears, both for
   * logging and for the buffer target. A prefetched track starts with a small
   * target so it does not compete for bandwidth; promotion expands it so ABR
   * has enough headroom to climb. The loader cannot observe that role change.
   */
  promoteToActive(activeBufferSeconds: number): void {
    this.label = 'актив'
    this.setTargetBuffer(activeBufferSeconds)
  }

  setTargetBuffer(seconds: number): void {
    if (seconds <= 0 || this.targetBufferSeconds === seconds) return

    this.targetBufferSeconds = seconds
    playerLog('buffer', `${this.label}: цель буфера → ${seconds} с`)
    void this.fill()
  }

  get bitrate(): number {
    return this.currentBitrate
  }

  get estimatedBps(): number | null {
    return this.abr.estimatedBps
  }

  /** Attaches a MediaSource to the audio element and starts filling the buffer. */
  async start(): Promise<void> {
    if (this.destroyed) return

    const { audio, manifest, onUnsupported } = this.input

    if (!canPlayThroughMse(manifest)) {
      onUnsupported?.()
      return
    }

    const mediaSource = new MediaSource()
    this.mediaSource = mediaSource
    this.objectUrl = URL.createObjectURL(mediaSource)
    audio.src = this.objectUrl

    await waitForMediaSourceOpen(
      mediaSource,
      this.lifecycleController.signal,
      positiveFiniteOr(
        this.input.sourceOpenTimeoutMs,
        DEFAULT_SOURCE_OPEN_TIMEOUT_MS,
      ),
    )

    if (this.destroyed) return

    const rendition = selectRendition(manifest, this.currentBitrate)
    if (!rendition) return

    const sourceBuffer = mediaSource.addSourceBuffer(mimeFor(rendition.codec))
    sourceBuffer.mode = 'segments'
    this.queue = new SourceBufferQueue({ sourceBuffer })

    /**
     * Without an explicit duration the element derives `seekable` from what is
     * already buffered, and any seek past the buffer is silently clamped.
     * Derived from ticks rather than `durationMs` so it stays exact.
     */
    const durationSeconds = manifest.durationTicks / manifest.timescale
    if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
      mediaSource.duration = durationSeconds
    }

    audio.addEventListener('waiting', this.handleStall)
    audio.addEventListener('seeking', this.handleSeeking)

    this.fillTimer = setInterval(() => void this.fill(), FILL_TICK_MS)
    await this.fill()
  }

  /** Stops all activity and releases the MediaSource. */
  destroy(): void {
    this.destroyed = true
    this.lifecycleController.abort()
    /** Invalidate any fill loop parked on an await. */
    this.epoch += 1

    if (this.fillTimer !== null) clearInterval(this.fillTimer)
    this.controller?.abort()
    this.queue?.abort()

    const { audio } = this.input
    audio.removeEventListener('waiting', this.handleStall)
    audio.removeEventListener('seeking', this.handleSeeking)

    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl)

    this.mediaSource = null
    this.queue = null
    this.objectUrl = null
  }

  /** Pins a rendition; ABR cannot replace it until `setAutoBitrate` is called. */
  setBitrate(bitrate: number): void {
    const hasRendition = this.input.manifest.renditions.some(
      (rendition) => rendition.bitrate === bitrate,
    )
    if (!hasRendition) {
      throw new RangeError(`Unknown rendition bitrate: ${bitrate}`)
    }

    this.automaticBitrate = false
    if (this.currentBitrate === bitrate) return
    this.currentBitrate = bitrate
    this.input.onBitrateChange?.(bitrate)
    void this.fill()
  }

  /** Restores throughput-driven selection after a manual bitrate pin. */
  setAutoBitrate(): void {
    if (this.automaticBitrate) return
    this.automaticBitrate = true
    void this.fill()
  }

  get isAutoBitrate(): boolean {
    return this.automaticBitrate
  }

  private handleStall = () => {
    this.hadStall = true
    playerLog(
      'error',
      `${this.label}: буфер опустел — следующий фрагмент возьмём с минимума`,
    )
  }

  private handleSeeking = () => {
    void this.seekTo(this.input.audio.currentTime)
  }

  /** Repoints the download head at a new time, cancelling work already in flight. */
  private async seekTo(timeSeconds: number): Promise<void> {
    const { manifest } = this.input
    const rendition = selectRendition(manifest, this.currentBitrate)
    if (!rendition) return

    /** Invalidate the running fill before touching shared state. */
    this.epoch += 1
    this.controller?.abort()
    this.queue?.abort()

    this.nextFragmentIndex = findFragmentIndexForSeek({
      buffered: this.input.audio.buffered,
      manifest,
      rendition,
      timeSeconds,
    })

    playerLog(
      'seek',
      `${this.label}: перемотка на ${timeSeconds.toFixed(1)} с → фрагмент #${this.nextFragmentIndex}`,
    )

    /**
     * Wait for the interrupted loop to actually unwind. Without this the restart
     * is swallowed by the `filling` guard and the seek stalls until the next
     * poll tick — painfully visible on a slow connection.
     */
    await this.fillPromise.catch(() => undefined)
    await this.fill()
  }

  /** True while this fill loop is still the current one. */
  private isCurrent(epoch: number): boolean {
    return !this.destroyed && this.epoch === epoch && this.queue !== null
  }

  /** Downloads fragments until the buffer reaches the target depth. */
  private fill(): Promise<void> {
    if (this.filling || this.destroyed) return Promise.resolve()
    if (!this.queue || !this.mediaSource) return Promise.resolve()
    if (this.mediaSource.readyState === 'closed') return Promise.resolve()

    this.fillPromise = this.runFill()
    return this.fillPromise
  }

  /** The actual download loop; always entered through `fill`. */
  private async runFill(): Promise<void> {
    this.filling = true
    const epoch = this.epoch

    try {
      const { audio, manifest } = this.input

      while (this.isCurrent(epoch)) {
        const bufferedAhead = getBufferedAhead(
          audio.buffered,
          audio.currentTime,
        )
        if (bufferedAhead >= this.targetBufferSeconds) break

        const nextBitrate = this.automaticBitrate
          ? this.abr.decide({
              bufferedAhead,
              currentBitrate: this.currentBitrate,
              hadStall: this.hadStall,
              manifest,
              nowMs: Date.now(),
            })
          : this.currentBitrate
        this.hadStall = false

        if (nextBitrate !== this.currentBitrate) {
          const direction = nextBitrate > this.currentBitrate ? '↑' : '↓'
          playerLog(
            'abr',
            `${this.label}: ${direction} ${this.currentBitrate}k → ${nextBitrate}k`,
            {
              'оценка полосы': this.abr.estimatedBps
                ? mbps(this.abr.estimatedBps)
                : 'ещё нет',
              'буфер впереди': `${bufferedAhead.toFixed(1)} с`,
            },
          )
          this.currentBitrate = nextBitrate
          this.input.onBitrateChange?.(nextBitrate)
        }

        const rendition = selectRendition(manifest, this.currentBitrate)
        if (!rendition) break

        const fragment = resolveFragment({
          manifest,
          rendition,
          index: this.nextFragmentIndex,
        })

        if (!fragment) {
          this.endOfStream()
          break
        }

        /** A retained seek range may already contain this exact fragment. */
        if (
          isTimeRangeBuffered(
            audio.buffered,
            fragment.startSeconds,
            fragment.endSeconds,
          )
        ) {
          this.nextFragmentIndex += 1
          continue
        }

        /** MSE requires the init segment of whichever rendition follows. */
        if (this.appendedInitFor !== rendition.bitrate) {
          const init = await this.request(
            rendition.bitrate,
            rendition.initRange,
            false,
            epoch,
          )
          if (init === null || !this.isCurrent(epoch)) break
          await this.queue?.append(init, audio.currentTime)
          if (!this.isCurrent(epoch)) break
          playerLog(
            'buffer',
            `${this.label}: init-сегмент ${rendition.bitrate}k добавлен`,
          )
          this.appendedInitFor = rendition.bitrate
        }

        const requestedAt = performance.now()
        const bytes = await this.request(
          rendition.bitrate,
          fragment.byteRange,
          true,
          epoch,
        )
        if (bytes === null || !this.isCurrent(epoch)) break

        logFragment({
          label: this.label,
          bitrate: rendition.bitrate,
          bufferedAhead,
          bytes: bytes.byteLength,
          durationMs: performance.now() - requestedAt,
          index: this.nextFragmentIndex,
        })

        await this.queue?.append(bytes, audio.currentTime)
        if (!this.isCurrent(epoch)) break
        await this.queue?.trim(audio.currentTime)
        if (!this.isCurrent(epoch)) break
        this.nextFragmentIndex += 1
      }
    } catch (error) {
      if (!this.destroyed && this.epoch === epoch) {
        this.input.onError?.(toError(error))
      }
    } finally {
      this.filling = false
    }
  }

  /**
   * Issues one ranged request, timing it for the ABR estimate.
   * Returns null when the request was aborted by a seek or teardown.
   */
  private async request(
    bitrate: number,
    range: readonly [number, number],
    measure: boolean,
    epoch: number,
  ): Promise<ArrayBuffer | null> {
    const maxAttempts = Math.max(
      1,
      Math.floor(
        positiveFiniteOr(
          this.input.maxRequestAttempts,
          DEFAULT_MAX_REQUEST_ATTEMPTS,
        ),
      ),
    )
    const timeoutMs = positiveFiniteOr(
      this.input.requestTimeoutMs,
      DEFAULT_REQUEST_TIMEOUT_MS,
    )
    const retryBaseDelayMs = nonNegativeFiniteOr(
      this.input.retryBaseDelayMs,
      DEFAULT_RETRY_BASE_DELAY_MS,
    )

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      if (!this.isCurrent(epoch)) return null

      const controller = new AbortController()
      this.controller = controller
      const startedAt = performance.now()
      let timedOut = false
      const timeoutId = setTimeout(() => {
        timedOut = true
        controller.abort()
      }, timeoutMs)

      try {
        let handleAbort: (() => void) | null = null
        const aborted = new Promise<never>((_resolve, reject) => {
          handleAbort = () => {
            const error = new Error(
              timedOut
                ? 'Audio fragment request timed out'
                : 'Audio fragment request aborted',
            )
            error.name = timedOut ? 'TimeoutError' : 'AbortError'
            reject(error)
          }
          controller.signal.addEventListener('abort', handleAbort, {
            once: true,
          })
        })

        let bytes: ArrayBuffer
        try {
          bytes = await Promise.race([
            this.input.fetchRange({
              bitrate,
              range,
              signal: controller.signal,
            }),
            aborted,
          ])
        } finally {
          if (handleAbort) {
            controller.signal.removeEventListener('abort', handleAbort)
          }
        }

        if (measure) {
          this.abr.addSample({
            bytes: bytes.byteLength,
            durationMs: performance.now() - startedAt,
          })

          const estimate = this.abr.estimatedBps
          if (estimate !== null) rememberThroughput({ bps: estimate })
        }

        return bytes
      } catch (caughtError) {
        if (controller.signal.aborted && !timedOut) return null

        const error = timedOut
          ? new Error('Audio fragment request timed out')
          : caughtError
        if (attempt === maxAttempts || !isRetryableRequestError(caughtError)) {
          throw toError(error)
        }

        clearTimeout(timeoutId)
        const delayMs = retryBaseDelayMs * 2 ** (attempt - 1)
        if (!(await waitForRetry(delayMs, controller.signal))) return null
      } finally {
        clearTimeout(timeoutId)
        if (this.controller === controller) this.controller = null
      }
    }

    return null
  }

  private endOfStream(): void {
    if (this.mediaSource?.readyState === 'open') {
      playerLog('buffer', `${this.label}: трек загружен целиком, поток закрыт`)
      this.mediaSource.endOfStream()
    }
  }
}

export { toRangeHeader }
