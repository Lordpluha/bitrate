import { describe, expect, it } from 'vitest'
import { endReasonOnChange } from './endReasonOnChange'
import { finishPlay, MIN_REPORTED_MS } from './finishPlay'
import type { TrackedPlay } from './playbackEvent.types'

const NOW = new Date('2026-11-23T10:03:00.000Z')

const play = (overrides: Partial<TrackedPlay> = {}): TrackedPlay => ({
  clientPlayId: '0199aee0-0000-7000-8000-000000000003',
  trackId: '0199aee0-0000-7000-8000-000000000002',
  startedAt: '2026-11-23T10:00:00.000Z',
  listenedMs: 180_000,
  last: { currentTime: 180, duration: 200, isPlaying: true },
  source: 'ALBUM',
  sourceId: '0199aee0-0000-7000-8000-000000000004',
  ...overrides,
})

describe('finishPlay', () => {
  it('builds the report the API expects', () => {
    expect(
      finishPlay({ play: play(), endReason: 'SKIPPED', now: NOW }),
    ).toEqual({
      clientPlayId: '0199aee0-0000-7000-8000-000000000003',
      trackId: '0199aee0-0000-7000-8000-000000000002',
      startedAt: '2026-11-23T10:00:00.000Z',
      endedAt: '2026-11-23T10:03:00.000Z',
      listenedMs: 180_000,
      endReason: 'SKIPPED',
      source: 'ALBUM',
      sourceId: '0199aee0-0000-7000-8000-000000000004',
    })
  })

  it('leaves the source id out when the source has none', () => {
    const body = finishPlay({
      play: play({ source: 'OTHER', sourceId: undefined }),
      endReason: 'STOPPED',
      now: NOW,
    })

    expect(body).not.toHaveProperty('sourceId')
  })

  it('reports nothing for a play barely heard', () => {
    expect(
      finishPlay({
        play: play({ listenedMs: MIN_REPORTED_MS - 1 }),
        endReason: 'SKIPPED',
        now: NOW,
      }),
    ).toBeNull()
  })
})

describe('endReasonOnChange', () => {
  it('treats a play that reached the end as completed', () => {
    const last = { currentTime: 199.2, duration: 200, isPlaying: false }
    expect(endReasonOnChange({ play: play({ last }) })).toBe('COMPLETED')
  })

  it('treats a play replaced before the end as skipped', () => {
    expect(endReasonOnChange({ play: play() })).toBe('SKIPPED')
  })

  it('treats a play with an unknown duration as skipped', () => {
    const last = { currentTime: 30, duration: 0, isPlaying: true }
    expect(endReasonOnChange({ play: play({ last }) })).toBe('SKIPPED')
  })
})
