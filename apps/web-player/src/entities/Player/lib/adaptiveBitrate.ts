import type { TrackManifest } from '@/entities/Player/model/manifest.types'

export type ThroughputSample = {
  bytes: number
  durationMs: number
}

export type AbrDecisionInput = {
  /** Seconds of media buffered ahead of the play head. */
  bufferedAhead: number
  /** Bitrate currently being downloaded, in kbps. */
  currentBitrate: number
  manifest: TrackManifest
  /** Set after a stall so the next fragment drops to the floor immediately. */
  hadStall?: boolean
  nowMs: number
}

/** Weight of the newest sample in the moving average. */
const EWMA_ALPHA = 0.35

/** Only spend this share of measured bandwidth, leaving room for jitter. */
const SAFETY_FACTOR = 0.75

/** Seconds of buffer below which we stop considering an upgrade. */
const UPGRADE_MIN_BUFFER = 12

/** How long throughput must support a higher rendition before upgrading. */
const UPGRADE_STABLE_MS = 8_000

/** Minimum gap between two quality changes. */
const SWITCH_COOLDOWN_MS = 5_000

/**
 * Picks the rendition for the *next* fragment from measured throughput.
 *
 * Asymmetric by design: a drop happens on the first bad sample, an upgrade only
 * after throughput has supported it for a while. A wrong decision costs exactly
 * one fragment, so reacting early is cheap and stalling is not.
 */
export class AdaptiveBitrateController {
  private throughputBps: number | null = null
  private upgradeEligibleSinceMs: number | null = null
  private lastSwitchMs = 0

  /** Records a completed fragment download. */
  addSample({ bytes, durationMs }: ThroughputSample): void {
    if (durationMs <= 0 || bytes <= 0) return

    const sampleBps = (bytes * 8 * 1000) / durationMs

    this.throughputBps =
      this.throughputBps === null
        ? sampleBps
        : EWMA_ALPHA * sampleBps + (1 - EWMA_ALPHA) * this.throughputBps
  }

  /** Measured bandwidth in bits per second, or null before the first sample. */
  get estimatedBps(): number | null {
    return this.throughputBps
  }

  /**
   * Primes the estimate from a previous track or session.
   *
   * Without this every track re-learns the connection from scratch and spends
   * its opening seconds on the lowest rung. The value is only a starting point:
   * the first real sample is blended in immediately, so a stale guess corrects
   * itself within one fragment.
   */
  seed(bps: number): void {
    if (bps > 0) this.throughputBps ??= bps
  }

  /** Resets the estimate, e.g. when playback moves to a different track. */
  reset(): void {
    this.throughputBps = null
    this.upgradeEligibleSinceMs = null
    this.lastSwitchMs = 0
  }

  /** Returns the bitrate to download next. */
  decide({
    bufferedAhead,
    currentBitrate,
    manifest,
    hadStall = false,
    nowMs,
  }: AbrDecisionInput): number {
    const ladder = manifest.renditions.map((rendition) => rendition.bitrate)
    const lowest = ladder[0] ?? currentBitrate

    /** A stall means the estimate was already wrong — drop to the floor now. */
    if (hadStall) {
      this.upgradeEligibleSinceMs = null
      if (currentBitrate !== lowest) this.lastSwitchMs = nowMs
      return lowest
    }

    if (this.throughputBps === null) return currentBitrate

    const affordableBps = this.throughputBps * SAFETY_FACTOR
    const affordable = [...ladder]
      .reverse()
      .find((bitrate) => bitrate * 1000 <= affordableBps)

    /** Even the lowest rendition is unaffordable — it is still the best option. */
    if (affordable === undefined) {
      this.upgradeEligibleSinceMs = null
      if (currentBitrate !== lowest) this.lastSwitchMs = nowMs
      return lowest
    }

    if (affordable < currentBitrate) {
      this.upgradeEligibleSinceMs = null
      this.lastSwitchMs = nowMs
      return affordable
    }

    if (affordable === currentBitrate) {
      this.upgradeEligibleSinceMs = null
      return currentBitrate
    }

    /** Upgrade path: require a healthy buffer, sustained throughput and a cooldown. */
    if (bufferedAhead < UPGRADE_MIN_BUFFER) {
      this.upgradeEligibleSinceMs = null
      return currentBitrate
    }

    this.upgradeEligibleSinceMs ??= nowMs

    const stableFor = nowMs - this.upgradeEligibleSinceMs
    const sinceLastSwitch = nowMs - this.lastSwitchMs

    if (stableFor < UPGRADE_STABLE_MS || sinceLastSwitch < SWITCH_COOLDOWN_MS) {
      return currentBitrate
    }

    this.upgradeEligibleSinceMs = null
    this.lastSwitchMs = nowMs

    /** Step up one rung rather than jumping the ladder. */
    const currentIndex = ladder.indexOf(currentBitrate)
    return ladder[currentIndex + 1] ?? affordable
  }
}
