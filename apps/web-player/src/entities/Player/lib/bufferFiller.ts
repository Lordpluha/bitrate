import type { BitrateSelector } from '@/entities/Player/lib/bitrateSelector'
import {
  findFragmentIndexForSeek,
  getBufferedAhead,
  isTimeRangeBuffered,
  resolveFragment,
  selectRendition,
} from '@/entities/Player/lib/fragmentIndex'
import {
  type FetchRangeInput,
  requestFragment,
  toError,
} from '@/entities/Player/lib/fragmentRequest'
import { logFragment, playerLog } from '@/entities/Player/lib/playerLog'
import type { SourceBufferQueue } from '@/entities/Player/lib/sourceBufferQueue'
import type { RequestRetryPolicy } from '@/entities/Player/lib/streamLoaderOptions'
import type { TrackManifest } from '@/entities/Player/model/manifest.types'

/** Everything the fill loop needs to keep one track's buffer topped up. */
export type BufferFillerInput = {
  audio: HTMLAudioElement
  manifest: TrackManifest
  selector: BitrateSelector
  fetchRange: (input: FetchRangeInput) => Promise<ArrayBuffer>
  retry: RequestRetryPolicy
  targetBufferSeconds: number
  label: string
  /** Called when the manifest has no fragment left to download. */
  onEndOfStream: () => void
  onError?: (error: Error) => void
}

/**
 * Downloads fragments until the buffer reaches its target depth.
 *
 * Owns the download cursor and the epoch that invalidates it: every `await`
 * inside the loop is followed by a currency check, so a seek is never
 * overwritten by the download it interrupted.
 */
export class BufferFiller {
  private readonly input: BufferFillerInput

  private queue: SourceBufferQueue | null = null
  private controller: AbortController | null = null
  private nextFragmentIndex = 0
  private appendedInitFor: number | null = null
  private filling = false
  /** Resolves when the running loop unwinds; lets a seek restart at once. */
  private fillPromise: Promise<void> = Promise.resolve()
  private targetBufferSeconds: number
  private label: string
  private stopped = false
  /** Bumped by every seek so a loop parked on an await knows it is stale. */
  private epoch = 0

  /** Creates a new instance. */
  constructor(input: BufferFillerInput) {
    this.input = input
    this.targetBufferSeconds = input.targetBufferSeconds
    this.label = input.label
  }

  /** Binds the loop to the buffer it appends into. */
  attach(queue: SourceBufferQueue): void {
    this.queue = queue
  }

  /** Renames the log prefix when the loader is promoted to the audible track. */
  setLabel(label: string): void {
    this.label = label
  }

  /** Changes how far ahead the loop downloads, refilling if the target grew. */
  setTargetBuffer(seconds: number): void {
    if (seconds <= 0 || this.targetBufferSeconds === seconds) return

    this.targetBufferSeconds = seconds
    playerLog('buffer', `${this.label}: цель буфера → ${seconds} с`)
    void this.fill()
  }

  /** Stops the loop and abandons any request in flight. */
  stop(): void {
    this.stopped = true
    this.epoch += 1
    this.controller?.abort()
    this.queue = null
  }

  /** True while this loop iteration is still the current one. */
  private isCurrent(epoch: number): boolean {
    return !this.stopped && this.epoch === epoch && this.queue !== null
  }

  /** Starts the download loop unless one is already running. */
  fill(): Promise<void> {
    if (this.filling || this.stopped || !this.queue) return Promise.resolve()

    this.fillPromise = this.runFill()
    return this.fillPromise
  }

  /** Repoints the download head at a new time, cancelling work already in flight. */
  async seekTo(timeSeconds: number): Promise<void> {
    const { audio, manifest, selector } = this.input
    const rendition = selectRendition(manifest, selector.bitrate)
    if (!rendition) return

    /** Invalidate the running loop before touching shared state. */
    this.epoch += 1
    this.controller?.abort()
    this.queue?.abort()

    this.nextFragmentIndex = findFragmentIndexForSeek({
      buffered: audio.buffered,
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

  /** Downloads one byte range, measuring throughput only for media fragments. */
  private request(
    bitrate: number,
    range: readonly [number, number],
    measure: boolean,
    epoch: number,
  ): Promise<ArrayBuffer | null> {
    return requestFragment({
      fetchRange: this.input.fetchRange,
      bitrate,
      range,
      retry: this.input.retry,
      isCurrent: () => this.isCurrent(epoch),
      onRequestStart: (controller) => {
        this.controller = controller
      },
      onRequestEnd: (controller) => {
        if (this.controller === controller) this.controller = null
      },
      onSample: measure
        ? (sample) => this.input.selector.addSample(sample)
        : undefined,
    })
  }

  /**
   * Appends the init segment of a rendition when the previous fragment came
   * from a different one — MSE requires it before the first media fragment.
   *
   * @returns `false` when the loop was superseded and must stop.
   */
  private async ensureInitSegment(
    bitrate: number,
    initRange: readonly [number, number],
    epoch: number,
  ) {
    if (this.appendedInitFor === bitrate) return true

    const init = await this.request(bitrate, initRange, false, epoch)
    if (init === null || !this.isCurrent(epoch)) return false

    await this.queue?.append(init, this.input.audio.currentTime)
    if (!this.isCurrent(epoch)) return false

    playerLog('buffer', `${this.label}: init-сегмент ${bitrate}k добавлен`)
    this.appendedInitFor = bitrate
    return true
  }

  /**
   * Downloads and appends one media fragment.
   *
   * @returns `false` when the loop was superseded and must stop.
   */
  private async appendFragment(
    bitrate: number,
    byteRange: readonly [number, number],
    bufferedAhead: number,
    epoch: number,
  ) {
    const requestedAt = performance.now()
    const bytes = await this.request(bitrate, byteRange, true, epoch)
    if (bytes === null || !this.isCurrent(epoch)) return false

    logFragment({
      label: this.label,
      bitrate,
      bufferedAhead,
      bytes: bytes.byteLength,
      durationMs: performance.now() - requestedAt,
      index: this.nextFragmentIndex,
    })

    const { audio } = this.input
    await this.queue?.append(bytes, audio.currentTime)
    if (!this.isCurrent(epoch)) return false

    await this.queue?.trim(audio.currentTime)
    if (!this.isCurrent(epoch)) return false

    this.nextFragmentIndex += 1
    return true
  }

  /** The actual download loop; always entered through `fill`. */
  private async runFill(): Promise<void> {
    this.filling = true
    const epoch = this.epoch
    const { audio, manifest, selector } = this.input

    try {
      while (this.isCurrent(epoch)) {
        const bufferedAhead = getBufferedAhead(
          audio.buffered,
          audio.currentTime,
        )
        if (bufferedAhead >= this.targetBufferSeconds) break

        const rendition = selectRendition(
          manifest,
          selector.next(bufferedAhead),
        )
        if (!rendition) break

        const fragment = resolveFragment({
          manifest,
          rendition,
          index: this.nextFragmentIndex,
        })
        if (!fragment) {
          this.input.onEndOfStream()
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

        if (
          !(await this.ensureInitSegment(
            rendition.bitrate,
            rendition.initRange,
            epoch,
          ))
        )
          break
        if (
          !(await this.appendFragment(
            rendition.bitrate,
            fragment.byteRange,
            bufferedAhead,
            epoch,
          ))
        )
          break
      }
    } catch (error) {
      if (!this.stopped && this.epoch === epoch)
        this.input.onError?.(toError(error))
    } finally {
      this.filling = false
    }
  }
}
