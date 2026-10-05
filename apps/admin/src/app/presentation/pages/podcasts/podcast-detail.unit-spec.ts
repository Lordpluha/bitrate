import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import {
  GetPodcastUseCase,
  RestorePodcastEpisodeUseCase,
  RestorePodcastUseCase,
  TakeDownPodcastEpisodeUseCase,
  TakeDownPodcastUseCase,
} from '@application/podcasts'
import { SessionStore } from '@application/session'
import type { PodcastDetail, PodcastEpisode } from '@domain/podcast'
import { ResourceWriteError } from '@domain/shared'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PodcastDetailPage } from './podcast-detail'

const ADMIN_STAFF = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

const PODCAST_ID = '9f2504e0-4f89-41d3-9a0c-0305e82c3301'
const TAKEN_DOWN = new Date('2026-09-10T08:00:00.000Z')

function episode(overrides: Partial<PodcastEpisode> = {}): PodcastEpisode {
  return {
    id: '5f2504e0-4f89-41d3-9a0c-0305e82c3305',
    podcastId: PODCAST_ID,
    title: 'Intro Episode',
    durationSeconds: 1800,
    releaseDate: new Date('2026-09-02T00:00:00.000Z'),
    explicit: false,
    takenDownAt: null,
    ...overrides,
  }
}

function detail(overrides: Partial<PodcastDetail> = {}): PodcastDetail {
  return {
    id: PODCAST_ID,
    title: 'Signal Hour',
    publisher: 'Bitrate FM',
    coverUrl: null,
    language: 'en',
    explicit: false,
    episodeCount: 2,
    takenDownAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    updatedAt: new Date('2026-09-01T09:59:00.000Z'),
    description: 'Late night radio about signals.',
    episodes: [
      episode(),
      episode({
        id: '5f2504e0-4f89-41d3-9a0c-0305e82c3306',
        title: 'Taken Episode',
        takenDownAt: TAKEN_DOWN,
      }),
    ],
    ...overrides,
  }
}

const getPodcast = vi.fn<() => Promise<PodcastDetail>>()
const takeDownPodcast = vi.fn<(input: unknown) => Promise<void>>()
const restorePodcast = vi.fn<(input: unknown) => Promise<void>>()
const takeDownEpisode = vi.fn<(input: unknown) => Promise<void>>()
const restoreEpisode = vi.fn<(input: unknown) => Promise<void>>()

function create(permissions: string[] = []): void {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: {}, uk: {} },
        translocoConfig: { availableLangs: [...LOCALES], defaultLang: DEFAULT_LOCALE },
      }),
    ],
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      { provide: GetPodcastUseCase, useValue: { execute: getPodcast } },
      { provide: TakeDownPodcastUseCase, useValue: { execute: takeDownPodcast } },
      { provide: RestorePodcastUseCase, useValue: { execute: restorePodcast } },
      { provide: TakeDownPodcastEpisodeUseCase, useValue: { execute: takeDownEpisode } },
      { provide: RestorePodcastEpisodeUseCase, useValue: { execute: restoreEpisode } },
    ],
  })
  TestBed.inject(SessionStore).set(
    permissions.length === 0
      ? ADMIN_STAFF
      : { ...ADMIN_STAFF, roleName: 'MODERATOR', permissions: permissions as never },
  )
}

function buttonLabelled(root: ParentNode, label: string): HTMLButtonElement | undefined {
  return Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.trim() === label)
}

function buttonByAria(root: ParentNode, label: string): HTMLButtonElement | undefined {
  return Array.from(root.querySelectorAll('button')).find(
    (b) => b.getAttribute('aria-label') === label,
  )
}

/** The podcast-level actions live above the tabs, so scope away from the episode table. */
function podcastButton(host: HTMLElement, label: string): HTMLButtonElement | undefined {
  return Array.from(host.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === label && !b.hasAttribute('aria-label'),
  )
}

async function render(): Promise<{ host: HTMLElement; settle: () => Promise<void> }> {
  const fixture = TestBed.createComponent(PodcastDetailPage)
  await fixture.whenStable()
  return { host: fixture.nativeElement as HTMLElement, settle: () => fixture.whenStable() }
}

describe('PodcastDetailPage', () => {
  beforeEach(() => {
    for (const mock of [takeDownPodcast, restorePodcast, takeDownEpisode, restoreEpisode]) {
      mock.mockReset()
      mock.mockResolvedValue(undefined)
    }
    getPodcast.mockReset()
  })

  it('lists every episode on the Episodes tab, each with its own take-down state', async () => {
    getPodcast.mockResolvedValue(detail())
    create()

    const { host } = await render()

    const rows = host.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0]?.textContent).toContain('Intro Episode')
    expect(rows[0]?.textContent).not.toContain('taken down')
    expect(rows[1]?.textContent).toContain('taken down')
    const panels = Array.from(host.querySelectorAll<HTMLElement>('[role="tabpanel"]'))
    expect(panels.map((panel) => panel.hidden)).toEqual([false, true])
  })

  it('shows the description and facts when the Metadata tab is opened', async () => {
    getPodcast.mockResolvedValue(detail())
    create()

    const { host, settle } = await render()
    buttonLabelled(host, 'Metadata')?.click()
    await settle()

    const panels = Array.from(host.querySelectorAll<HTMLElement>('[role="tabpanel"]'))
    expect(panels.map((panel) => panel.hidden)).toEqual([true, false])
    expect(panels[1]?.textContent).toContain('Late night radio about signals.')
    expect(panels[1]?.textContent).toContain('Bitrate FM')
  })

  it('shows the not-found message when the load rejects', async () => {
    getPodcast.mockRejectedValue(new Error('404'))
    create()

    const { host } = await render()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('could not be found')
  })

  it('offers each episode the action its own state allows, independent of the podcast', async () => {
    getPodcast.mockResolvedValue(detail({ takenDownAt: TAKEN_DOWN }))
    create()

    const { host } = await render()

    expect(buttonByAria(host, 'Take down episode Intro Episode')).toBeDefined()
    expect(buttonByAria(host, 'Restore episode Intro Episode')).toBeUndefined()
    expect(buttonByAria(host, 'Restore episode Taken Episode')).toBeDefined()
    expect(buttonByAria(host, 'Take down episode Taken Episode')).toBeUndefined()
    expect(podcastButton(host, 'Restore')).toBeDefined()
    expect(podcastButton(host, 'Take down')).toBeUndefined()
  })

  it('hides every action from an operator holding only podcasts:read', async () => {
    getPodcast.mockResolvedValue(detail())
    create(['podcasts:read'])

    const { host } = await render()

    expect(host.querySelectorAll('button[aria-label^="Take down episode"]')).toHaveLength(0)
    expect(host.querySelectorAll('button[aria-label^="Restore episode"]')).toHaveLength(0)
    expect(podcastButton(host, 'Take down')).toBeUndefined()
    expect(host.textContent).toContain('No actions available.')
  })

  /** AC2: the podcast take-down calls the podcast use case only, never an episode one. */
  it('takes the podcast down only after confirmation, sending the typed reason', async () => {
    getPodcast.mockResolvedValue(detail())
    create()

    const { host, settle } = await render()
    podcastButton(host, 'Take down')?.click()
    await settle()

    expect(takeDownPodcast).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('keep their own state')

    const textarea = document.body.querySelector<HTMLTextAreaElement>('#podcast-action-reason')
    if (textarea) {
      textarea.value = ' rights claim '
      textarea.dispatchEvent(new Event('input'))
    }
    buttonLabelled(document.body, 'Yes, take down')?.click()
    await settle()

    expect(takeDownPodcast).toHaveBeenCalledWith({
      podcast: expect.objectContaining({ title: 'Signal Hour' }),
      reason: 'rights claim',
    })
    expect(takeDownEpisode).not.toHaveBeenCalled()
    expect(getPodcast).toHaveBeenCalledTimes(2)
  })

  /** AC1: the episode take-down calls the episode use case with that episode only. */
  it('takes one episode down after confirmation without touching the podcast', async () => {
    getPodcast.mockResolvedValue(detail())
    create()

    const { host, settle } = await render()
    buttonByAria(host, 'Take down episode Intro Episode')?.click()
    await settle()

    expect(takeDownEpisode).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Only this episode is hidden')

    buttonLabelled(document.body, 'Yes, take down')?.click()
    await settle()

    expect(takeDownEpisode).toHaveBeenCalledWith({
      episode: expect.objectContaining({ title: 'Intro Episode', podcastId: PODCAST_ID }),
      reason: undefined,
    })
    expect(takeDownPodcast).not.toHaveBeenCalled()
    expect(host.querySelector('[role="status"]')?.textContent).toContain(
      'The podcast and its other episodes were not changed.',
    )
  })

  it('restores a taken-down episode after confirmation', async () => {
    getPodcast.mockResolvedValue(detail())
    create()

    const { host, settle } = await render()
    buttonByAria(host, 'Restore episode Taken Episode')?.click()
    await settle()
    expect(restoreEpisode).not.toHaveBeenCalled()

    buttonLabelled(document.body, 'Yes, restore')?.click()
    await settle()

    expect(restoreEpisode).toHaveBeenCalledWith({
      episode: expect.objectContaining({ title: 'Taken Episode' }),
      reason: undefined,
    })
    expect(restorePodcast).not.toHaveBeenCalled()
  })

  it('restores a taken-down podcast after confirmation', async () => {
    getPodcast.mockResolvedValue(detail({ takenDownAt: TAKEN_DOWN }))
    create()

    const { host, settle } = await render()
    podcastButton(host, 'Restore')?.click()
    await settle()
    buttonLabelled(document.body, 'Yes, restore')?.click()
    await settle()

    expect(restorePodcast).toHaveBeenCalledWith({
      podcast: expect.objectContaining({ title: 'Signal Hour' }),
      reason: undefined,
    })
    expect(restoreEpisode).not.toHaveBeenCalled()
  })

  it('shows the stale-state message and reloads when an episode was already taken down elsewhere', async () => {
    getPodcast.mockResolvedValue(detail())
    takeDownEpisode.mockRejectedValue(new ResourceWriteError('already-deactivated'))
    create()

    const { host, settle } = await render()
    buttonByAria(host, 'Take down episode Intro Episode')?.click()
    await settle()
    buttonLabelled(document.body, 'Yes, take down')?.click()
    await settle()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('already taken down')
    expect(getPodcast).toHaveBeenCalledTimes(2)
  })
})
