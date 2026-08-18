import { AdaptiveBitrateController } from '@/entities/Player/lib/adaptiveBitrate'
import {
  findFragmentIndexAt,
  getBufferedAhead,
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
}

const DEFAULT_TARGET_BUFFER_SECONDS = 30

/** How often the fill loop re-checks the buffer. */
const FILL_TICK_MS = 250

const mimeFor = (codec: string) => `audio/mp4; codecs="${codec}"`

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

  private currentBitrate: number
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
   * Raises or lowers how much media is kept ahead of the play head.
   *
   * A track prefetched into the standby slot starts with a small target so it
   * does not compete with what is playing. Once it becomes the active track the
   * target must grow, otherwise the buffer stays shallow forever and the
   * bitrate ladder can never climb.
   */
  /**
   * Marks this loader as playing the track the user actually hears, both for
   * logging and for the buffer target. Call this from the same place that
   * promotes the slot to active — the loader has no way to observe that on
   * its own.
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
    const { audio, manifest, onUnsupported } = this.input

    if (!canPlayThroughMse(manifest)) {
      onUnsupported?.()
      return
    }

    const mediaSource = new MediaSource()
    this.mediaSource = mediaSource
    this.objectUrl = URL.createObjectURL(mediaSource)
    audio.src = this.objectUrl

    await new Promise<void>((resolve) => {
      mediaSource.addEventListener('sourceopen', () => resolve(), {
        once: true,
      })
    })

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

  /** Pins a rendition and disables automatic switching until `auto` is restored. */
  setBitrate(bitrate: number): void {
    this.currentBitrate = bitrate
    this.input.onBitrateChange?.(bitrate)
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

    this.nextFragmentIndex = findFragmentIndexAt({
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
    if (this.mediaSource.readyState !== 'open') return Promise.resolve()

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

        const nextBitrate = this.abr.decide({
          bufferedAhead,
          currentBitrate: this.currentBitrate,
          hadStall: this.hadStall,
          manifest,
          nowMs: Date.now(),
        })
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

        /** MSE requires the init segment of whichever rendition follows. */
        if (this.appendedInitFor !== rendition.bitrate) {
          const init = await this.request(
            rendition.bitrate,
            rendition.initRange,
            false,
          )
          if (init === null || !this.isCurrent(epoch)) break
          await this.queue?.append(init, audio.currentTime)
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
        this.nextFragmentIndex += 1
      }
    } catch (error) {
      this.input.onError?.(
        error instanceof Error ? error : new Error(String(error)),
      )
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
  ): Promise<ArrayBuffer | null> {
    this.controller = new AbortController()
    const startedAt = performance.now()

    try {
      const bytes = await this.input.fetchRange({
        bitrate,
        range,
        signal: this.controller.signal,
      })

      if (measure) {
        this.abr.addSample({
          bytes: bytes.byteLength,
          durationMs: performance.now() - startedAt,
        })

        const estimate = this.abr.estimatedBps
        if (estimate !== null) rememberThroughput({ bps: estimate })
      }

      return bytes
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError')
        return null
      throw error
    }
  }

  private endOfStream(): void {
    if (this.mediaSource?.readyState === 'open') {
      playerLog('buffer', `${this.label}: трек загружен целиком, поток закрыт`)
      this.mediaSource.endOfStream()
    }
  }
}

export { toRangeHeader }
