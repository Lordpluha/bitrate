import { afterEach, describe, expect, it, vi } from 'vitest'
import { BITRATE_PLAYER_PART_TAG, type BitratePlayerElement } from '../contract'

/** The Play button's label for the fixture track. */
const PLAY = 'Play "Night Drive"'

/** Part elements a host composes inside `<bitrate-player>` to build its own layout. */
async function mountComposed(markup: string): Promise<BitratePlayerElement> {
  const { defineBitratePlayer } = await import('./index')
  await defineBitratePlayer()

  const wrapper = document.createElement('div')
  wrapper.innerHTML = `<bitrate-player track-title="Night Drive" artist="Neon Avenue">${markup}</bitrate-player>`
  document.body.append(wrapper)
  const element = wrapper.querySelector('bitrate-player')
  if (!element) throw new Error('player not parsed')
  return element
}

function partRoot(element: Element, tagName: string): ShadowRoot {
  const part = element.querySelector(tagName)
  if (!part?.shadowRoot) throw new Error(`<${tagName}> has not upgraded`)
  return part.shadowRoot
}

describe('<bitrate-player> composed from parts', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('registers every part tag alongside the root', async () => {
    const { defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()

    for (const tagName of Object.values(BITRATE_PLAYER_PART_TAG)) {
      expect(customElements.get(tagName), tagName).toBeDefined()
    }
  })

  it('drops the built-in layout once the host composes parts, and the parts read the root', async () => {
    const element = await mountComposed(`
      <bitrate-player-cover size="sm"></bitrate-player-cover>
      <bitrate-player-meta></bitrate-player-meta>
    `)

    await expect
      .poll(
        () => partRoot(element, 'bitrate-player-meta').querySelector('.track-title')?.textContent,
      )
      .toBe('Night Drive')
    expect(element.shadowRoot?.querySelector('[part="layout"]')).toBeNull()
    expect(partRoot(element, 'bitrate-player-cover').querySelector('.cover--sm')).not.toBeNull()

    element.trackTitle = 'Afterglow'
    await expect
      .poll(
        () => partRoot(element, 'bitrate-player-meta').querySelector('.track-title')?.textContent,
      )
      .toBe('Afterglow')
  })

  it('keeps the built-in layout when the host leaves only whitespace inside the tag', async () => {
    const element = await mountComposed('\n   \n')

    await expect.poll(() => element.shadowRoot?.querySelector('.root')).not.toBeNull()
  })

  it('plays through a composed transport and narrows it by controls ∩ callbacks', async () => {
    const element = await mountComposed(
      '<bitrate-player-transport controls="prev play next"></bitrate-player-transport>',
    )
    const resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
    element.renditions = [{ bitrate: 320, label: '320 kbps' }]
    element.resolveSource = resolveSource
    element.onNext = vi.fn()
    element.onShuffleToggle = vi.fn()

    const labels = () =>
      [...partRoot(element, 'bitrate-player-transport').querySelectorAll('button')].map((button) =>
        button.getAttribute('aria-label'),
      )
    await expect.poll(labels).toEqual([PLAY, 'Next track'])

    const play = partRoot(element, 'bitrate-player-transport').querySelector('.play-button')
    if (!(play instanceof HTMLButtonElement)) throw new Error('play button missing')
    await expect.poll(() => play.disabled).toBe(false)
    play.click()

    await expect.poll(() => resolveSource.mock.calls.length).toBeGreaterThan(0)
    await expect
      .poll(() => element.shadowRoot?.querySelector('audio')?.getAttribute('src'))
      .toBe('https://cdn.test/320.m4a')
  })

  it('invokes the root callback from a composed actions part', async () => {
    const element = await mountComposed(
      '<bitrate-player-actions controls="queue"></bitrate-player-actions>',
    )
    const onQueueOpen = vi.fn()
    element.onQueueOpen = onQueueOpen
    element.onExpand = vi.fn()

    const queue = await vi.waitFor(() => {
      const found = partRoot(element, 'bitrate-player-actions').querySelector(
        '[aria-label="Open queue"]',
      )
      if (!(found instanceof HTMLButtonElement)) throw new Error('queue button not rendered')
      return found
    })
    queue.click()

    expect(onQueueOpen).toHaveBeenCalledTimes(1)
    expect(
      partRoot(element, 'bitrate-player-actions').querySelector('[aria-label="Open full player"]'),
    ).toBeNull()
  })

  it('connects a part added after the root has mounted', async () => {
    const element = await mountComposed('<bitrate-player-meta></bitrate-player-meta>')
    await expect
      .poll(() => partRoot(element, 'bitrate-player-meta').querySelector('.track-title'))
      .not.toBeNull()

    element.append(document.createElement('bitrate-player-seek'))

    await expect
      .poll(() => partRoot(element, 'bitrate-player-seek').querySelector('input[type="range"]'))
      .not.toBeNull()
  })

  it("renders the host's labels, keeping the English defaults for the rest", async () => {
    const element = await mountComposed(
      '<bitrate-player-transport controls="play next repeat"></bitrate-player-transport>',
    )
    element.onNext = vi.fn()
    element.onRepeatToggle = vi.fn()
    element.labels = {
      play: (title) => `Відтворити «${title}»`,
      repeat: { off: 'Повторювати плейлист' },
    }

    const names = () =>
      [...partRoot(element, 'bitrate-player-transport').querySelectorAll('button')].map((button) =>
        button.getAttribute('aria-label'),
      )
    await expect
      .poll(names)
      .toEqual(['Відтворити «Night Drive»', 'Next track', 'Повторювати плейлист'])
  })

  it('takes its content width in a flex row when composed', async () => {
    const element = await mountComposed(
      '<bitrate-player-transport controls="play"></bitrate-player-transport>',
    )
    const row = element.parentElement
    if (!row) throw new Error('player has no wrapper')
    row.style.display = 'flex'

    await vi.waitFor(() => {
      if (!partRoot(element, 'bitrate-player-transport').querySelector('.play-button')) {
        throw new Error('play button not rendered')
      }
    })

    expect(element.getBoundingClientRect().width).toBeGreaterThan(0)
  })

  it('puts the time under the rail for a stacked seek', async () => {
    const element = await mountComposed(
      '<bitrate-player-seek variant="stacked"></bitrate-player-seek>',
    )

    const root = await vi.waitFor(() => {
      const seek = partRoot(element, 'bitrate-player-seek')
      if (!seek.querySelector('.readouts')) throw new Error('stacked seek not rendered')
      return seek
    })
    const rail = root.querySelector('input')?.getBoundingClientRect()
    const readouts = root.querySelector('.readouts')?.getBoundingClientRect()

    expect(readouts?.top).toBeGreaterThanOrEqual(rail?.bottom ?? Number.POSITIVE_INFINITY)
    expect(root.querySelectorAll('.readouts .time')).toHaveLength(2)
  })

  it('renders nothing for a part outside any player', async () => {
    const { defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()

    const orphan = document.createElement('bitrate-player-transport')
    document.body.append(orphan)

    await expect.poll(() => orphan.shadowRoot).not.toBeNull()
    expect(orphan.shadowRoot?.querySelector('button')).toBeNull()
  })
})
