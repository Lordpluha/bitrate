import {
  AdaptiveBitrateController,
  type ThroughputSample,
} from '@/entities/Player/lib/adaptiveBitrate'
import { mbps, playerLog } from '@/entities/Player/lib/playerLog'
import {
  pickStartBitrate,
  readRememberedThroughput,
  rememberThroughput,
} from '@/entities/Player/lib/throughputMemory'
import type { TrackManifest } from '@/entities/Player/model/manifest.types'

/** What a selector needs to pick a starting rendition and report changes. */
export type BitrateSelectorInput = {
  manifest: TrackManifest
  /** Overrides the throughput-derived starting rendition. */
  initialBitrate?: number
  onChange?: (bitrate: number) => void
}

/**
 * Owns which rendition the loader downloads next.
 *
 * Keeps the throughput estimate, the manual/automatic mode, and the stall flag
 * together, so the fill loop only has to ask for the next bitrate.
 */
export class BitrateSelector {
  private readonly abr = new AdaptiveBitrateController()
  private readonly manifest: TrackManifest
  private readonly onChange?: (bitrate: number) => void

  private current: number
  private automatic = true
  private hadStall = false
  private label: string

  /** Creates a new instance, seeded from throughput remembered across sessions. */
  constructor({ manifest, initialBitrate, onChange }: BitrateSelectorInput) {
    this.manifest = manifest
    this.onChange = onChange
    this.label = 'плеер'

    const remembered = readRememberedThroughput()
    if (remembered !== null) this.abr.seed(remembered)

    this.current =
      initialBitrate ??
      pickStartBitrate({ manifest, throughputBps: remembered }) ??
      0
  }

  /** The rendition currently being downloaded. */
  get bitrate(): number {
    return this.current
  }

  /** The rolling throughput estimate, or `null` before the first sample. */
  get estimatedBps(): number | null {
    return this.abr.estimatedBps
  }

  /** Whether throughput is allowed to change the rendition. */
  get isAutomatic(): boolean {
    return this.automatic
  }

  /** Renames the log prefix when the loader is promoted to the audible track. */
  setLabel(label: string): void {
    this.label = label
  }

  /** Records that the buffer ran dry, so the next choice drops to the floor. */
  noteStall(): void {
    this.hadStall = true
    playerLog(
      'error',
      `${this.label}: буфер опустел — следующий фрагмент возьмём с минимума`,
    )
  }

  /** Feeds one completed download into the throughput estimate. */
  addSample(sample: ThroughputSample): void {
    this.abr.addSample(sample)

    const estimate = this.abr.estimatedBps
    if (estimate !== null) rememberThroughput({ bps: estimate })
  }

  /**
   * Pins a rendition; throughput cannot replace it until `enableAutomatic`.
   *
   * @returns whether the change warrants refilling the buffer.
   * @throws RangeError when the manifest has no such rendition.
   */
  pin(bitrate: number): boolean {
    const known = this.manifest.renditions.some(
      (rendition) => rendition.bitrate === bitrate,
    )
    if (!known) throw new RangeError(`Unknown rendition bitrate: ${bitrate}`)

    this.automatic = false
    if (this.current === bitrate) return false

    this.current = bitrate
    this.onChange?.(bitrate)
    return true
  }

  /**
   * Restores throughput-driven selection after a manual pin.
   *
   * @returns whether the change warrants refilling the buffer.
   */
  enableAutomatic(): boolean {
    if (this.automatic) return false

    this.automatic = true
    return true
  }

  /** Chooses the rendition for the next fragment, logging any switch. */
  next(bufferedAhead: number): number {
    const chosen = this.automatic
      ? this.abr.decide({
          bufferedAhead,
          currentBitrate: this.current,
          hadStall: this.hadStall,
          manifest: this.manifest,
          nowMs: Date.now(),
        })
      : this.current
    this.hadStall = false

    if (chosen === this.current) return chosen

    playerLog(
      'abr',
      `${this.label}: ${chosen > this.current ? '↑' : '↓'} ${this.current}k → ${chosen}k`,
      {
        'оценка полосы': this.abr.estimatedBps
          ? mbps(this.abr.estimatedBps)
          : 'ещё нет',
        'буфер впереди': `${bufferedAhead.toFixed(1)} с`,
      },
    )
    this.current = chosen
    this.onChange?.(chosen)
    return chosen
  }
}
