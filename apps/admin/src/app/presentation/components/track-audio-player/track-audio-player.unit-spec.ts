import { HttpErrorResponse } from '@angular/common/http'
import { provideZonelessChangeDetection } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { PrepareTrackAudioUseCase } from '@application/catalog'
import type { TrackAudioFile, TrackAudioSource, TrackDetail } from '@domain/track'
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { TrackAudioPlayer } from './track-audio-player'

const TRACK_ID = '9f2504e0-4f89-41d3-9a0c-0305e82c3301'

const TAG_NAME = vi.hoisted(() => 'bitrate-player')

/**
 * `TrackAudioPlayer` only reaches through the DOM-property surface `@bitrate/player`
 * documents (`renditions`, `trackTitle`, `resolveSource`) — jsdom cannot run the real Svelte
 * custom element, so this stubs registration with a bare `HTMLElement` subclass and asserts
 * the bindings, not the player's internal behaviour. The player's own behaviour is covered by
 * `packages/player`'s browser specs.
 */
vi.mock('@bitrate/player', () => {
  if (!customElements.get(TAG_NAME)) {
    customElements.define(
      TAG_NAME,
      class extends HTMLElement {
        renditions: unknown
        trackTitle: unknown
        coverUrl: unknown
        resolveSource: unknown
      },
    )
  }
  return { BITRATE_PLAYER_TAG_NAME: TAG_NAME, defineBitratePlayer: () => Promise.resolve() }
})

type BitratePlayerStub = HTMLElement & {
  renditions: { bitrate: number; label: string }[]
  trackTitle: string
  coverUrl: string
  resolveSource: (request: { bitrate: number | null }) => Promise<string>
}

function cmaf(bitrate: number): TrackAudioFile {
  return { id: `cmaf-${bitrate}`, format: 'cmaf', bitrate, codec: 'mp4a.40.2', size: 2048 }
}

function detail(overrides: Partial<TrackDetail> = {}): TrackDetail {
  return {
    id: TRACK_ID,
    title: 'Night Drive',
    artistId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    artistUsername: 'dj-test',
    coverUrl: null,
    processingStatus: 'READY',
    processingError: null,
    processingAttempts: 1,
    processingStartedAt: null,
    processingFinishedAt: new Date('2026-09-01T10:02:00.000Z'),
    updatedAt: new Date('2026-09-01T10:02:00.000Z'),
    takenDownAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    audioFiles: [
      cmaf(128),
      cmaf(320),
      cmaf(192),
      { id: 'opus-320', format: 'opus', bitrate: 320, codec: 'opus', size: 2048 },
    ],
    artists: [],
    genres: [],
    albums: [],
    openReportCount: 0,
    ...overrides,
  }
}

function source(bitrate: number): TrackAudioSource {
  return { url: `https://cdn.bitrate.test/tracks/${TRACK_ID}/${bitrate}.m4a`, bitrate }
}

const execute: Mock<PrepareTrackAudioUseCase['execute']> = vi.fn()

let current: ComponentFixture<TrackAudioPlayer> | null = null

async function render(track: TrackDetail = detail()): Promise<{
  fixture: ComponentFixture<TrackAudioPlayer>
  host: HTMLElement
  player: BitratePlayerStub
}> {
  const fixture = TestBed.createComponent(TrackAudioPlayer)
  fixture.componentRef.setInput('track', track)
  current = fixture
  await fixture.whenStable()
  /** `elementReady` flips once `customElements.whenDefined()` resolves — one more macrotask. */
  await new Promise((resolve) => setTimeout(resolve))
  await fixture.whenStable()

  const host = fixture.nativeElement as HTMLElement
  const player = host.querySelector(TAG_NAME) as BitratePlayerStub

  return { fixture, host, player }
}

describe('TrackAudioPlayer', () => {
  beforeEach(() => {
    execute.mockReset()
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PrepareTrackAudioUseCase, useValue: { execute } },
      ],
    })
  })

  afterEach(() => {
    current?.destroy()
    current = null
  })

  it('renders the element only once it has upgraded, with renditions highest-first and the title', async () => {
    const { player } = await render()

    expect(player).not.toBeNull()
    expect(player.renditions).toEqual([
      { bitrate: 320, label: '320 kbps (AAC)' },
      { bitrate: 192, label: '192 kbps (AAC)' },
      { bitrate: 128, label: '128 kbps (AAC)' },
    ])
    expect(player.trackTitle).toBe('Night Drive')
  })

  it('binds an empty string, not null, when the track has no cover — the element renders its own placeholder', async () => {
    const { player } = await render(detail({ coverUrl: null }))

    expect(player.coverUrl).toBe('')
  })

  it('binds the resolved cover URL when the track has one', async () => {
    const { player } = await render(
      detail({ coverUrl: 'https://api.bitrate.test/static/tracks/covers/abc123.png' }),
    )

    expect(player.coverUrl).toBe('https://api.bitrate.test/static/tracks/covers/abc123.png')
  })

  it("mounts no Angular-owned <audio> element — playback is the custom element's own concern", async () => {
    const { host } = await render()

    expect(host.querySelector('audio')).toBeNull()
  })

  describe('resolveSource', () => {
    it('probes the requested bitrate and resolves the returned URL', async () => {
      execute.mockResolvedValue(source(192))
      const { player } = await render()

      await expect(player.resolveSource({ bitrate: 192 })).resolves.toBe(source(192).url)
      expect(execute).toHaveBeenCalledExactlyOnceWith({ id: TRACK_ID, bitrate: 192 })
    })

    it('falls back to the highest rendition when asked for a null bitrate', async () => {
      execute.mockResolvedValue(source(320))
      const { player } = await render()

      await player.resolveSource({ bitrate: null })

      expect(execute).toHaveBeenCalledExactlyOnceWith({ id: TRACK_ID, bitrate: 320 })
    })

    it('rejects with the mapped message when the probe answers 404', async () => {
      execute.mockRejectedValue(new HttpErrorResponse({ status: 404 }))
      const { player } = await render()

      await expect(player.resolveSource({ bitrate: 320 })).rejects.toThrow(
        'This rendition is no longer available.',
      )
    })

    it('rejects with the mapped message when the session has expired', async () => {
      execute.mockRejectedValue(new HttpErrorResponse({ status: 401 }))
      const { player } = await render()

      await expect(player.resolveSource({ bitrate: 320 })).rejects.toThrow(
        'Your session has expired — press Play to continue.',
      )
    })

    it('rejects with a generic message for any other probe failure', async () => {
      execute.mockRejectedValue(new Error('network down'))
      const { player } = await render()

      await expect(player.resolveSource({ bitrate: 320 })).rejects.toThrow(
        'Could not start playback — press Play to continue.',
      )
    })
  })
})
