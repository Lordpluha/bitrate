import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core'
import { PrepareTrackAudioUseCase } from '@application/catalog'
import { listenableRenditions, type TrackAudioFile, type TrackDetail } from '@domain/track'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { hlm } from '@spartan-ng/helm/utils'
import {
  PLAYBACK_STOPPED_MESSAGE,
  probeAudioErrorMessage,
  UNSUPPORTED_RENDITION_MESSAGE,
} from './track-audio-error.message'
import { renditionLabel } from './track-audio.formatter'

const SOURCE_NOT_SUPPORTED_CODE = 4

/**
 * Plays a READY track's CMAF rendition from the track detail header. Never autoplays: `<audio>`
 * only gets a `src` from the user's own click, through `PrepareTrackAudioUseCase`'s `HEAD` probe,
 * which lets the auth interceptor refresh an expired access token first.
 *
 * The `<audio>` element stays mounted for the component's whole lifetime and is toggled with
 * `[hidden]` rather than an `@if`, so the `viewChild` reference used from `onPlayPause` is never
 * racing a structural render — it is perceptually and semantically "shown once a source is
 * prepared" (hidden elements are out of the accessibility tree and tab order) without that race.
 */
@Component({
  selector: 'app-track-audio-player',
  imports: [HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './track-audio-player.html',
})
export class TrackAudioPlayer {
  private readonly prepareAudio = inject(PrepareTrackAudioUseCase)
  private readonly audio = viewChild.required<ElementRef<HTMLAudioElement>>('audio')

  readonly track = input.required<TrackDetail>()

  protected readonly renditions = computed(() => listenableRenditions(this.track()))
  protected readonly selectedBitrate = signal<number | null>(null)
  protected readonly effectiveBitrate = computed(
    () => this.selectedBitrate() ?? this.renditions()[0]?.bitrate ?? null,
  )
  protected readonly sourceBitrate = signal<number | null>(null)
  protected readonly playing = signal(false)
  protected readonly preparing = signal(false)
  protected readonly error = signal<string | null>(null)
  protected readonly selectClass = hlm(
    'h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm text-foreground shadow-xs',
  )

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      const element = this.audio().nativeElement
      element.pause()
      element.removeAttribute('src')
      element.load()
    })
  }

  protected label(file: TrackAudioFile): string {
    return renditionLabel(file)
  }

  protected playPauseLabel(): string {
    return `${this.playing() ? 'Pause' : 'Play'} "${this.track().title}"`
  }

  protected onQualityChange(bitrate: string): void {
    this.selectedBitrate.set(Number(bitrate))
    /** Simple path: a quality change while playing stops playback rather than resuming mid-track. */
    if (this.playing()) this.stop()
  }

  protected async onPlayPause(): Promise<void> {
    if (this.playing()) {
      this.stop()
      return
    }

    const bitrate = this.effectiveBitrate()
    if (bitrate === null) return

    this.error.set(null)

    if (this.sourceBitrate() !== bitrate) {
      this.preparing.set(true)
      try {
        const source = await this.prepareAudio.execute({ id: this.track().id, bitrate })
        this.audio().nativeElement.src = source.url
        this.sourceBitrate.set(source.bitrate)
      } catch (probeError) {
        this.error.set(probeAudioErrorMessage(probeError))
        return
      } finally {
        this.preparing.set(false)
      }
    }

    try {
      await this.audio().nativeElement.play()
      this.playing.set(true)
    } catch {
      this.error.set(PLAYBACK_STOPPED_MESSAGE)
    }
  }

  protected onMediaError(): void {
    const code = this.audio().nativeElement.error?.code
    this.playing.set(false)

    if (code === SOURCE_NOT_SUPPORTED_CODE) {
      this.error.set(UNSUPPORTED_RENDITION_MESSAGE)
      return
    }

    this.error.set(PLAYBACK_STOPPED_MESSAGE)
    this.sourceBitrate.set(null)
  }

  private stop(): void {
    this.audio().nativeElement.pause()
    this.playing.set(false)
  }
}
