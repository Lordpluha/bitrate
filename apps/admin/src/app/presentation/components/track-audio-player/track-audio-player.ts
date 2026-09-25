import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core'
import { PrepareTrackAudioUseCase } from '@application/catalog'
import { listenableRenditions, type TrackDetail } from '@domain/track'
import { BITRATE_PLAYER_TAG_NAME } from '@bitrate/player'
import type { BitratePlayerRendition, BitratePlayerSourceResolver } from '@bitrate/player/contract'
import { probeAudioErrorMessage } from './track-audio-error.message'
import { renditionLabel } from './track-audio.formatter'

/**
 * Hosts the `<bitrate-player>` custom element for a READY track's CMAF renditions. Renders it
 * only once the element has upgraded — properties assigned before `customElements.define()`
 * resolves are not guaranteed to survive the upgrade (see `@bitrate/player`'s contract) — and
 * resolves each play request through `PrepareTrackAudioUseCase`'s `HEAD` probe, which lets the
 * auth interceptor refresh an expired access token before the audio source is assigned.
 */
@Component({
  selector: 'app-track-audio-player',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './track-audio-player.html',
})
export class TrackAudioPlayer {
  private readonly prepareAudio = inject(PrepareTrackAudioUseCase)

  readonly track = input.required<TrackDetail>()

  protected readonly elementReady = signal(false)
  protected readonly renditions = computed<BitratePlayerRendition[]>(() =>
    listenableRenditions(this.track()).map((file) => ({
      bitrate: file.bitrate,
      label: renditionLabel(file),
    })),
  )

  constructor() {
    void customElements.whenDefined(BITRATE_PLAYER_TAG_NAME).then(() => this.elementReady.set(true))
  }

  protected readonly resolveSource: BitratePlayerSourceResolver = async ({ bitrate }) => {
    const target = bitrate ?? this.renditions()[0]?.bitrate ?? null
    if (target === null) throw new Error('This rendition is no longer available.')

    try {
      const source = await this.prepareAudio.execute({ id: this.track().id, bitrate: target })
      return source.url
    } catch (probeError) {
      throw new Error(probeAudioErrorMessage(probeError))
    }
  }
}
