import { BitrateSelector } from '@/entities/Player/lib/bitrateSelector'
import { BufferFiller } from '@/entities/Player/lib/bufferFiller'
import { selectRendition } from '@/entities/Player/lib/fragmentIndex'
import type { FetchRangeInput } from '@/entities/Player/lib/fragmentRequest'
import {
  attachMediaSource,
  canPlayThroughMse,
  openAudioSourceBuffer,
  waitForMediaSourceOpen,
} from '@/entities/Player/lib/mediaSourceSupport'
import { playerLog } from '@/entities/Player/lib/playerLog'
import { SourceBufferQueue } from '@/entities/Player/lib/sourceBufferQueue'
import {
  FILL_TICK_MS,
  resolveStreamLoaderOptions,
  type StreamLoaderTunables,
} from '@/entities/Player/lib/streamLoaderOptions'
import type { TrackManifest } from '@/entities/Player/model/manifest.types'

/** Everything a stream loader needs in order to drive one track. */
export type StreamLoaderInput = StreamLoaderTunables & {
  audio: HTMLAudioElement
  manifest: TrackManifest
  /** Downloads one byte range of one rendition. */
  fetchRange: (input: FetchRangeInput) => Promise<ArrayBuffer>
  /** Prefix used in player logs; switches to `актив` once promoted. */
  label?: string
  /** Overrides the throughput-derived starting rendition. */
  initialBitrate?: number
  onUnsupported?: () => void
  onError?: (error: Error) => void
  onBitrateChange?: (bitrate: number) => void
}

/**
 * Drives playback by pulling one fragment at a time into a single `SourceBuffer`.
 *
 * Owns the MediaSource lifecycle and the public playback API; the download loop
 * lives in `BufferFiller` and the quality choice in `BitrateSelector`. Deciding
 * all three here rather than leaving them to the browser is the whole point of
 * the byte-range design. See ADR-0020.
 */
export class StreamLoader {
  private readonly input: StreamLoaderInput
  private readonly selector: BitrateSelector
  private readonly filler: BufferFiller
  private readonly lifecycleController = new AbortController()
  private readonly sourceOpenTimeoutMs: number

  private mediaSource: MediaSource | null = null
  private objectUrl: string | null = null
  private fillTimer: ReturnType<typeof setInterval> | null = null
  private label: string
  private destroyed = false

  /** Creates a new instance. */
  constructor(input: StreamLoaderInput) {
    const options = resolveStreamLoaderOptions(input)

    this.input = input
    this.label = input.label ?? 'плеер'
    this.sourceOpenTimeoutMs = options.sourceOpenTimeoutMs
    this.selector = new BitrateSelector({
      manifest: input.manifest,
      initialBitrate: input.initialBitrate,
      onChange: input.onBitrateChange,
    })
    this.filler = new BufferFiller({
      audio: input.audio,
      manifest: input.manifest,
      selector: this.selector,
      fetchRange: input.fetchRange,
      retry: options.retry,
      targetBufferSeconds: options.targetBufferSeconds,
      label: this.label,
      onEndOfStream: () => this.endOfStream(),
      onError: input.onError,
    })
  }

  /**
   * Marks this loader as playing the track the user actually hears, both for
   * logging and for the buffer target. A prefetched track starts with a small
   * target so it does not compete for bandwidth; promotion expands it so ABR
   * has enough headroom to climb. The loader cannot observe that role change.
   */
  promoteToActive(activeBufferSeconds: number): void {
    this.label = 'актив'
    this.selector.setLabel(this.label)
    this.filler.setLabel(this.label)
    this.setTargetBuffer(activeBufferSeconds)
  }

  /** Changes how far ahead of the playhead the loader downloads. */
  setTargetBuffer(seconds: number): void {
    this.filler.setTargetBuffer(seconds)
  }

  get bitrate(): number {
    return this.selector.bitrate
  }

  get estimatedBps(): number | null {
    return this.selector.estimatedBps
  }

  get isAutoBitrate(): boolean {
    return this.selector.isAutomatic
  }

  /** Attaches a MediaSource to the audio element and starts filling the buffer. */
  async start(): Promise<void> {
    if (this.destroyed) return

    const { audio, manifest, onUnsupported } = this.input
    if (!canPlayThroughMse(manifest)) {
      onUnsupported?.()
      return
    }

    const rendition = selectRendition(manifest, this.selector.bitrate)
    if (!rendition) return

    const { mediaSource, objectUrl } = attachMediaSource(audio)
    this.mediaSource = mediaSource
    this.objectUrl = objectUrl

    await waitForMediaSourceOpen(
      mediaSource,
      this.lifecycleController.signal,
      this.sourceOpenTimeoutMs,
    )
    if (this.destroyed) return

    const sourceBuffer = openAudioSourceBuffer({
      mediaSource,
      manifest,
      codec: rendition.codec,
    })
    this.filler.attach(new SourceBufferQueue({ sourceBuffer }))
    audio.addEventListener('waiting', this.handleStall)
    audio.addEventListener('seeking', this.handleSeeking)

    this.fillTimer = setInterval(() => void this.filler.fill(), FILL_TICK_MS)
    await this.filler.fill()
  }

  /** Stops all activity and releases the MediaSource. */
  destroy(): void {
    this.destroyed = true
    this.lifecycleController.abort()
    this.filler.stop()

    if (this.fillTimer !== null) clearInterval(this.fillTimer)

    const { audio } = this.input
    audio.removeEventListener('waiting', this.handleStall)
    audio.removeEventListener('seeking', this.handleSeeking)

    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl)

    this.mediaSource = null
    this.objectUrl = null
  }

  /** Pins a rendition; ABR cannot replace it until `setAutoBitrate` is called. */
  setBitrate(bitrate: number): void {
    if (this.selector.pin(bitrate)) void this.filler.fill()
  }

  /** Restores throughput-driven selection after a manual bitrate pin. */
  setAutoBitrate(): void {
    if (this.selector.enableAutomatic()) void this.filler.fill()
  }

  private handleStall = () => {
    this.selector.noteStall()
  }

  private handleSeeking = () => {
    void this.filler.seekTo(this.input.audio.currentTime)
  }

  /** Closes the stream once every fragment has been appended. */
  private endOfStream(): void {
    if (this.mediaSource?.readyState !== 'open') return

    playerLog('buffer', `${this.label}: трек загружен целиком, поток закрыт`)
    this.mediaSource.endOfStream()
  }
}

export { toRangeHeader } from '@/entities/Player/lib/fragmentIndex'
