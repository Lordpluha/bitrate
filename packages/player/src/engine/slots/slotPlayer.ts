/**
 * Two media elements that play `source` and prefetch `next`, moved out of web-player's
 * `useAudioPlayer`/`useAudioSlots`/`useAudioPlayerEvents` for #236. The host still decides what
 * plays and what comes next — it sets `source` and `next` keyed per play — and this owns the
 * rest: the CMAF path with adaptive bitrate, the host's legacy chain as fallback, prefetching
 * the next track into the standby element and switching to it instantly, delaying the first
 * play on a constrained connection, and saving the resume position.
 */
import type {
  BitratePlayerEndedDetail,
  BitratePlayerErrorDetail,
  BitratePlayerSource,
  BitratePlayerStateDetail,
  BitratePlayerStreaming,
  TrackManifest,
} from '../../contract'
import { canPlayThroughMse, playerLog, StreamLoader } from '../cmaf'
import { shouldDelayInitialPlayback, shouldPrefetchNextTrack } from './network'

/** Buffer target for the track being heard. */
export const ACTIVE_BUFFER_SECONDS = 30

/** The next track only needs enough to start at once; more would starve the current one. */
const PREFETCH_BUFFER_SECONDS = 8

/** `timeupdate` fires ~4×/s; the resume position only needs about one write a second. */
const POSITION_SAVE_INTERVAL_MS = 1000

/** Shown, and reported through `onFatalError`, when nothing can play the current track. */
const UNPLAYABLE_MESSAGE = 'Unable to play this track. Please try again.'

/** How close to the end the hand-over to a prefetched next track is scheduled. */
const GAPLESS_ARM_SECONDS = 1

/**
 * The next track starts this long before the current one ends, covering the time media
 * elements take to begin output; the tail keeps playing underneath for that moment.
 */
const GAPLESS_LEAD_SECONDS = 0.05

/** `HTMLMediaElement.HAVE_FUTURE_DATA`, kept local so this module reads no DOM globals. */
const HAVE_FUTURE_DATA = 3

type SlotIndex = 0 | 1

type Slot = {
  media: HTMLAudioElement
  key: string | null
  loader: StreamLoader | null
  legacy: { destroy: () => void } | null
  bitrate: number | null
  /** The CMAF ladder of the track in this slot, lowest first. */
  renditions: number[]
}

type PendingPrefetch = {
  slot: SlotIndex
  source: BitratePlayerSource
}

export type SlotPlayerInput = {
  media: readonly [HTMLAudioElement, HTMLAudioElement]
  streaming: BitratePlayerStreaming
  /** Every state change, including each `timeupdate` of the element being heard. */
  onStateChange: (state: BitratePlayerStateDetail) => void
  /** The element being heard reported `play` or `pause` for the current source. */
  onPlayingChange: (playing: boolean) => void
  onEnded: (detail: BitratePlayerEndedDetail) => void
  /** The current source failed and nothing in the chain can play it. */
  onFatalError: (detail: BitratePlayerErrorDetail) => void
}

const otherSlot = (index: SlotIndex): SlotIndex => (index === 0 ? 1 : 0)

export class SlotPlayer {
  private readonly input: SlotPlayerInput
  private readonly slots: [Slot, Slot]
  private readonly cleanup: Array<() => void> = []

  private active: SlotIndex = 0
  private current: BitratePlayerSource | null = null
  private next: BitratePlayerSource | null = null
  private previousKey: string | null = null
  private wantPlaying = false
  private pendingPlay = false
  private pendingPrefetch: PendingPrefetch | null = null
  private gaplessTimer: ReturnType<typeof setTimeout> | null = null
  /** The prefetched key already started ahead of the current track's end. */
  private earlyStartedKey: string | null = null
  private seeking = false
  private lastPositionSave = 0
  private volume = 1
  private muted = false
  private error: BitratePlayerErrorDetail | null = null
  /** The listener's manual rendition, carried over to the tracks that follow; `null` is Auto. */
  private pinnedBitrate: number | null = null
  private destroyed = false

  constructor(input: SlotPlayerInput) {
    this.input = input
    this.slots = [this.emptySlot(input.media[0]), this.emptySlot(input.media[1])]
    this.listen(0)
    this.listen(1)

    const view = input.media[0].ownerDocument.defaultView
    if (view) {
      const savePosition = () => this.saveActivePosition()
      view.addEventListener('pagehide', savePosition)
      this.cleanup.push(() => view.removeEventListener('pagehide', savePosition))
    }
  }

  /** The current playback state. */
  get state(): BitratePlayerStateDetail {
    const slot = this.slots[this.active]
    const { media } = slot
    const heard = this.current !== null && slot.key === this.current.key
    /** Until the media knows its length, the source's own duration and start stand in. */
    const loaded = heard && Number.isFinite(media.duration) && media.duration > 0
    const duration = loaded ? media.duration : heard ? (this.current?.duration ?? 0) : 0
    const currentTime = loaded ? media.currentTime : heard ? (this.current?.startTime ?? 0) : 0

    return {
      status: this.status(heard),
      key: heard ? slot.key : null,
      currentTime,
      duration,
      volume: this.volume,
      muted: this.muted,
      bitrate: heard ? slot.bitrate : null,
      renditions: heard ? slot.renditions : [],
      autoBitrate: this.pinnedBitrate === null,
      error: this.error,
    }
  }

  /** Sets what plays now; the key `next` held switches to the prefetched element at once. */
  setSource(source: BitratePlayerSource | null): void {
    if (source?.key !== this.previousKey) {
      /** Every play gets a fresh key, so the previous one's position can never resume again. */
      if (this.previousKey) this.input.streaming.positions?.remove(this.previousKey)
      this.previousKey = source?.key ?? null
      this.error = null
    }
    /** Moving on to the play started early keeps it; anything else drops the hand-over. */
    if (source?.key !== this.earlyStartedKey) this.cancelGapless()
    this.current = source
    this.reconcile()
    this.applyPlayIntent()
    this.emit()
  }

  /** Sets what to prefetch once the current track nears its end. */
  setNext(next: BitratePlayerSource | null): void {
    this.next = next
    this.reconcile()
    this.emit()
  }

  play(): void {
    this.wantPlaying = true
    this.applyPlayIntent()
  }

  pause(): void {
    this.wantPlaying = false
    this.cancelGapless()
    this.applyPlayIntent()
  }

  seek(seconds: number): void {
    if (!Number.isFinite(seconds)) return
    const { media } = this.slots[this.active]
    this.cancelGapless()
    this.seeking = true
    media.currentTime = seconds
    if (this.current) this.input.streaming.positions?.save(this.current.key, seconds)
    this.emit()
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume))
    for (const slot of this.slots) slot.media.volume = this.volume
    this.emit()
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    for (const slot of this.slots) slot.media.muted = muted
    this.emit()
  }

  /**
   * Pins a CMAF rendition, or returns to adaptive bitrate with `null`. The pin holds for the
   * tracks that follow, at their closest rendition at or below it.
   */
  setBitrate(bitrate: number | null): void {
    this.pinnedBitrate = bitrate
    for (const slot of this.slots) this.applyPin(slot)
    this.emit()
  }

  private applyPin(slot: Slot): void {
    const { loader } = slot
    if (!loader) return
    if (this.pinnedBitrate === null) {
      loader.setAutoBitrate()
      return
    }
    const pinned = this.pinnedBitrate
    const affordable = slot.renditions.filter((bitrate) => bitrate <= pinned)
    const target = affordable.at(-1) ?? slot.renditions[0]
    if (target !== undefined) loader.setBitrate(target)
  }

  destroy(): void {
    this.destroyed = true
    this.cancelGapless()
    this.saveActivePosition()
    this.destroySlot(0)
    this.destroySlot(1)
    for (const dispose of this.cleanup) dispose()
  }

  private emptySlot(media: HTMLAudioElement): Slot {
    return { media, key: null, loader: null, legacy: null, bitrate: null, renditions: [] }
  }

  private status(heard: boolean): BitratePlayerStateDetail['status'] {
    if (this.error) return 'error'
    if (!this.current) return 'idle'
    const { media } = this.slots[this.active]
    if (heard && !media.paused) return 'playing'
    if (this.wantPlaying && (!heard || media.readyState < HAVE_FUTURE_DATA)) return 'loading'
    return 'paused'
  }

  private emit(): void {
    if (!this.destroyed) this.input.onStateChange(this.state)
  }

  private isConstrained(): boolean {
    return this.input.streaming.isConstrained?.() ?? false
  }

  /** The bookkeeping `useAudioPlayer` ran whenever the current or next track changed. */
  private reconcile(): void {
    const { current, next } = this
    if (!current) {
      this.pendingPlay = false
      this.pendingPrefetch = null
      this.destroySlot(0)
      this.destroySlot(1)
      return
    }

    this.pendingPrefetch = null
    const activeIndex = this.active
    const standbyIndex = otherSlot(activeIndex)
    const prefetchable = next && next.key !== current.key ? next : null

    if (this.slots[standbyIndex].key === current.key) {
      this.switchTo(standbyIndex)
      if (prefetchable) this.prefetchWhenBuffered(activeIndex, prefetchable)
      else this.destroySlot(activeIndex)
      return
    }

    if (this.slots[activeIndex].key !== current.key) this.attach(activeIndex, current, false)
    if (prefetchable) this.prefetchWhenBuffered(standbyIndex, prefetchable)
    else this.destroySlot(standbyIndex)
  }

  private applyPlayIntent(): void {
    const slot = this.slots[this.active]
    if (!this.current || slot.key !== this.current.key) return

    if (!this.wantPlaying) {
      this.pendingPlay = false
      slot.media.pause()
      return
    }
    if (shouldDelayInitialPlayback(slot.media, this.isConstrained())) {
      this.pendingPlay = true
      return
    }
    this.pendingPlay = false
    void slot.media.play().catch(() => undefined)
  }

  private switchTo(index: SlotIndex): void {
    const previous = this.slots[this.active]
    const next = this.slots[index]
    if (this.active === index) return

    this.active = index
    /** A prefetched slot carries a shallow buffer and a prefetch label; promote both. */
    next.loader?.promoteToActive(ACTIVE_BUFFER_SECONDS)
    next.media.volume = this.volume
    next.media.muted = this.muted
    /** Already started just before the previous track ended: keep it running, no restart. */
    const startedEarly = this.earlyStartedKey === next.key && !next.media.paused
    this.earlyStartedKey = null
    this.cancelGapless()
    if (!startedEarly) {
      next.media.currentTime = 0
      void next.media.play().catch(() => undefined)
    }
    previous.media.pause()
  }

  private prefetchWhenBuffered(index: SlotIndex, source: BitratePlayerSource): void {
    if (this.slots[index].key === source.key) {
      this.pendingPrefetch = null
      return
    }

    if (shouldPrefetchNextTrack(this.slots[this.active].media, this.isConstrained())) {
      this.pendingPrefetch = null
      this.attach(index, source, true)
      return
    }

    this.pendingPrefetch = { slot: index, source }
  }

  private resetMedia(slot: Slot): void {
    slot.legacy?.destroy()
    slot.legacy = null
    slot.loader?.destroy()
    slot.loader = null
    slot.bitrate = null
    slot.renditions = []
    slot.media.pause()
    slot.media.removeAttribute('src')
    slot.media.load()
  }

  private destroySlot(index: SlotIndex): void {
    const slot = this.slots[index]
    if (slot.key === null && !slot.loader && !slot.legacy) return
    this.resetMedia(slot)
    slot.key = null
  }

  private attach(index: SlotIndex, source: BitratePlayerSource, isPrefetch: boolean): void {
    const slot = this.slots[index]
    const { media } = slot
    const { key, trackId } = source
    if (slot.key === key) return

    this.destroySlot(index)
    slot.key = key
    media.preload = 'auto'
    const { crossOrigin } = this.input.streaming
    if (crossOrigin) media.crossOrigin = crossOrigin
    media.volume = this.volume
    media.muted = this.muted

    const stopPlayback = () => {
      if (slot.key !== key) return
      this.resetMedia(slot)
      this.pendingPlay = false
      /** Checked live: a prefetched slot may since have become the one being heard. */
      if (this.active === index) {
        this.wantPlaying = false
        this.error = { code: 'playback', message: UNPLAYABLE_MESSAGE }
        this.emit()
        this.input.onFatalError(this.error)
      }
    }

    const attachLegacy = () => {
      if (slot.key !== key) return
      try {
        slot.legacy = this.attachLegacy(media, source, isPrefetch, stopPlayback)
      } catch {
        stopPlayback()
      }
    }

    let fellBack = false
    const fallBackFromCmaf = () => {
      if (fellBack || slot.key !== key) return
      fellBack = true
      this.input.streaming.positions?.save(key, media.currentTime)
      slot.loader?.destroy()
      slot.loader = null
      slot.bitrate = null
      if (!isPrefetch && this.active === index) this.pendingPlay = true
      this.restoreOnMetadata(slot, source)
      attachLegacy()
    }

    void this.input.streaming
      .resolveManifest(trackId)
      .then((manifest) => {
        /** A newer track claimed this slot while the manifest was loading. */
        if (slot.key !== key) return
        const attached =
          manifest !== null && this.attachCmaf(slot, source, manifest, isPrefetch, fallBackFromCmaf)
        if (!attached) attachLegacy()
      })
      .catch(attachLegacy)

    if (!isPrefetch) this.restoreOnMetadata(slot, source)
  }

  private attachLegacy(
    media: HTMLAudioElement,
    source: BitratePlayerSource,
    isPrefetch: boolean,
    onFatalError: () => void,
  ): { destroy: () => void } {
    const { legacy } = this.input.streaming
    if (legacy) {
      return legacy({
        media,
        key: source.key,
        trackId: source.trackId,
        progressiveUrl: source.progressiveUrl,
        isPrefetch,
        onFatalError,
      })
    }

    media.addEventListener('error', onFatalError, { once: true })
    media.src = source.progressiveUrl
    media.load()
    return { destroy: () => media.removeEventListener('error', onFatalError) }
  }

  private attachCmaf(
    slot: Slot,
    source: BitratePlayerSource,
    manifest: TrackManifest,
    isPrefetch: boolean,
    onFatalError: () => void,
  ): boolean {
    const { key, trackId } = source
    if (!canPlayThroughMse(manifest)) {
      playerLog('path', 'MSE недоступен → откат на запасной путь', { trackId })
      return false
    }

    playerLog('path', `CMAF${isPrefetch ? ' (префетч следующего трека)' : ''}`, {
      рендиции: manifest.renditions.map((rendition) => `${rendition.bitrate}k`).join(', '),
      trackId,
    })

    const loader = new StreamLoader({
      audio: slot.media,
      label: isPrefetch ? 'префетч' : 'актив',
      manifest,
      targetBufferSeconds: isPrefetch ? PREFETCH_BUFFER_SECONDS : ACTIVE_BUFFER_SECONDS,
      fetchRange: ({ bitrate, range, signal }) => {
        const rendition = manifest.renditions.find((candidate) => candidate.bitrate === bitrate)
        if (!rendition) return Promise.reject(new Error(`Unknown rendition bitrate: ${bitrate}`))
        return this.input.streaming.fetchRange({
          trackId,
          bitrate,
          expectedSize: rendition.size,
          range,
          signal,
        })
      },
      onBitrateChange: (bitrate) => {
        slot.bitrate = bitrate
        if (this.slots[this.active] === slot) this.emit()
      },
      onError: (error) => {
        playerLog('error', `загрузчик упал: ${error.message}`, { trackId })
        if (slot.loader === loader && slot.key === key) onFatalError()
      },
      onUnsupported: onFatalError,
    })

    slot.loader = loader
    slot.renditions = manifest.renditions
      .map((rendition) => rendition.bitrate)
      .sort((a, b) => a - b)
    this.applyPin(slot)
    /** `onBitrateChange` reports switches only; the opening rendition is read once here. */
    slot.bitrate = loader.bitrate
    if (this.slots[this.active] === slot) this.emit()
    void loader.start().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      playerLog('error', `загрузчик не запустился: ${message}`, { trackId })
      if (slot.loader === loader && slot.key === key) onFatalError()
    })
    return true
  }

  /**
   * Seeks to where the play left off once metadata loads, unless another track took the slot:
   * the position store's entry for the key, else the source's `startTime`.
   */
  private restoreOnMetadata(slot: Slot, source: BitratePlayerSource): void {
    const { key } = source
    const { positions } = this.input.streaming
    slot.media.addEventListener(
      'loadedmetadata',
      () => {
        if (slot.key !== key) return
        const saved = positions?.restore(key) ?? source.startTime ?? null
        if (saved !== null && saved > 0 && saved < slot.media.duration) {
          slot.media.currentTime = saved
        }
      },
      { once: true },
    )
  }

  private saveActivePosition(): void {
    const slot = this.slots[this.active]
    if (!this.current || slot.key !== this.current.key) return
    this.lastPositionSave = Date.now()
    this.input.streaming.positions?.save(this.current.key, slot.media.currentTime)
  }

  /**
   * Schedules the hand-over once the current track is within a second of its end, playing and
   * with the next play already prefetched — so the next one starts on time instead of after
   * `ended` and the switch that follows it.
   */
  private armGapless(): void {
    if (this.gaplessTimer || this.earlyStartedKey || !this.wantPlaying) return
    const next = this.next
    const { media } = this.slots[this.active]
    const standby = this.slots[otherSlot(this.active)]
    if (!next || standby.key !== next.key || media.paused) return
    if (!Number.isFinite(media.duration)) return

    const remaining = media.duration - media.currentTime
    if (remaining > GAPLESS_ARM_SECONDS) return

    const delayMs = Math.max(0, (remaining - GAPLESS_LEAD_SECONDS) * 1000)
    this.gaplessTimer = setTimeout(() => {
      this.gaplessTimer = null
      this.startEarly(next.key)
    }, delayMs)
  }

  private startEarly(key: string): void {
    const standby = this.slots[otherSlot(this.active)]
    if (standby.key !== key || !this.wantPlaying || this.seeking) return
    this.earlyStartedKey = key
    standby.media.volume = this.volume
    standby.media.muted = this.muted
    standby.media.currentTime = 0
    void standby.media.play().catch(() => {
      if (this.earlyStartedKey === key) this.earlyStartedKey = null
    })
  }

  /** Called on a seek, a pause or a new source: the hand-over no longer applies. */
  private cancelGapless(): void {
    if (this.gaplessTimer) clearTimeout(this.gaplessTimer)
    this.gaplessTimer = null
    const key = this.earlyStartedKey
    if (!key) return
    this.earlyStartedKey = null
    const standby = this.slots[otherSlot(this.active)]
    if (standby.key === key) {
      standby.media.pause()
      standby.media.currentTime = 0
    }
  }

  private isHeard(index: SlotIndex): boolean {
    return (
      index === this.active && this.current !== null && this.slots[index].key === this.current.key
    )
  }

  private listen(index: SlotIndex): void {
    const { media } = this.slots[index]
    const on = (type: string, handler: () => void) => {
      media.addEventListener(type, handler)
      this.cleanup.push(() => media.removeEventListener(type, handler))
    }

    on('loadedmetadata', () => {
      if (index === this.active) this.emit()
    })
    on('timeupdate', () => {
      if (index !== this.active || this.seeking) return
      this.armGapless()
      this.emit()
      if (this.current && Date.now() - this.lastPositionSave >= POSITION_SAVE_INTERVAL_MS) {
        this.saveActivePosition()
      }
    })
    on('seeked', () => {
      this.seeking = false
      if (index === this.active) this.emit()
    })
    /**
     * Also the start point for a play asked for before the source was attached: attaching
     * waits on the manifest, and assigning `src` then aborts that earlier `play()`. web-player
     * used to recover only on `progress`, which a small file may never fire.
     */
    on('canplay', () => {
      if (!this.isHeard(index) || !this.wantPlaying) return
      if (this.pendingPlay && shouldDelayInitialPlayback(media, this.isConstrained())) return
      this.pendingPlay = false
      if (media.paused) void media.play().catch(() => undefined)
    })
    on('progress', () => this.handleProgress(index))
    on('play', () => {
      if (!this.isHeard(index)) return
      this.emit()
      this.input.onPlayingChange(true)
    })
    on('pause', () => {
      if (!this.isHeard(index)) return
      this.saveActivePosition()
      this.emit()
      this.input.onPlayingChange(false)
    })
    on('ended', () => {
      if (index !== this.active || !this.current) return
      const { key } = this.current
      this.input.streaming.positions?.remove(key)
      this.input.onEnded({ key })
    })
  }

  private handleProgress(index: SlotIndex): void {
    if (index !== this.active) return
    const { media } = this.slots[index]
    const constrained = this.isConstrained()

    if (this.wantPlaying && this.pendingPlay && !shouldDelayInitialPlayback(media, constrained)) {
      this.pendingPlay = false
      void media.play().catch(() => undefined)
    } else if (this.wantPlaying && media.paused && !this.pendingPlay && this.isHeard(index)) {
      void media.play().catch(() => undefined)
    }

    const pending = this.pendingPrefetch
    if (pending && shouldPrefetchNextTrack(media, constrained)) {
      this.pendingPrefetch = null
      this.attach(pending.slot, pending.source, true)
    }
  }
}
