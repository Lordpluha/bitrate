import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BitratePlayerElement, PlayerChrome } from '../contract'

/** The Play button's label for the fixture track. */
const PLAY = 'Play "Night Drive"'

/**
 * The built-in layouts `chrome` selects. Every optional callback is set in each test, so what
 * a layout leaves out is its own choice, not a missing callback.
 */
async function mountPlayer(chrome?: PlayerChrome): Promise<BitratePlayerElement> {
  const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
  await defineBitratePlayer()

  const element = document.createElement(BITRATE_PLAYER_TAG_NAME)
  if (chrome) element.setAttribute('chrome', chrome)
  element.style.width = '960px'
  document.body.append(element)

  element.trackTitle = 'Night Drive'
  element.artist = 'Neon Avenue'
  element.renditions = [{ bitrate: 320, label: '320 kbps' }]
  element.resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
  element.onNext = vi.fn()
  element.onPrevious = vi.fn()
  element.onLikeToggle = vi.fn()
  element.onShuffleToggle = vi.fn()
  element.onRepeatToggle = vi.fn()
  element.onExpand = vi.fn()
  element.onPictureInPicture = vi.fn()
  element.onQueueOpen = vi.fn()

  await expect.poll(() => element.shadowRoot?.querySelector('[part="layout"]')).not.toBeNull()
  return element
}

function labels(element: BitratePlayerElement): string[] {
  return [...(element.shadowRoot?.querySelectorAll('button') ?? [])].map(
    (button) => button.getAttribute('aria-label') ?? '',
  )
}

function layoutBox(element: BitratePlayerElement): DOMRect {
  const layout = element.shadowRoot?.querySelector('[part="layout"]')
  if (!layout) throw new Error('layout not rendered')
  return layout.getBoundingClientRect()
}

describe('<bitrate-player chrome>', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('renders the bar with every supplied control when chrome is absent', async () => {
    const element = await mountPlayer()

    expect(labels(element)).toEqual([
      'Like',
      'Open floating player',
      'Enable shuffle',
      'Previous track',
      PLAY,
      'Next track',
      'Repeat playlist',
      'Mute',
      'Open queue',
      'Open full player',
    ])
  })

  it('narrows mini to Play and Next, without seek readouts or volume', async () => {
    const element = await mountPlayer('mini')

    expect(labels(element)).toEqual([PLAY, 'Next track'])
    expect(element.shadowRoot?.querySelector('input[aria-label="Seek playback"]')).not.toBeNull()
    expect(element.shadowRoot?.querySelector('.time')).toBeNull()
    expect(element.shadowRoot?.querySelector('.volume')).toBeNull()
  })

  it('lays expanded out as a column with a larger cover and Play button than the bar', async () => {
    const bar = await mountPlayer('bar')
    const barCover = bar.shadowRoot?.querySelector('.cover')?.getBoundingClientRect()
    const barPlay = bar.shadowRoot?.querySelector('.play-button')?.getBoundingClientRect()
    const barHeight = layoutBox(bar).height
    bar.remove()

    const expanded = await mountPlayer('expanded')
    const cover = expanded.shadowRoot?.querySelector('.cover')?.getBoundingClientRect()
    const play = expanded.shadowRoot?.querySelector('.play-button')?.getBoundingClientRect()

    expect(cover?.width).toBeGreaterThan((barCover?.width ?? 0) * 3)
    expect(play?.width).toBeGreaterThan(barPlay?.width ?? 0)
    expect(layoutBox(expanded).height).toBeGreaterThan(barHeight * 3)
    expect(labels(expanded)).toContain('Like')
    expect(labels(expanded)).toContain('Open queue')
    expect(labels(expanded)).not.toContain('Open full player')
  })

  it('narrows floating to Previous, Play and Next over the cover art', async () => {
    const element = await mountPlayer('floating')

    expect(labels(element)).toEqual(['Previous track', PLAY, 'Next track'])
    const backdrop = element.shadowRoot?.querySelector('.backdrop')?.getBoundingClientRect()
    expect(backdrop?.width).toBeCloseTo(layoutBox(element).width, 0)
  })

  it('still hides a control the layout allows when its callback is missing', async () => {
    const element = await mountPlayer('floating')
    element.onPrevious = null

    await expect.poll(() => labels(element)).toEqual([PLAY, 'Next track'])
  })

  it('renders no built-in layout for none, and switches layout when chrome changes', async () => {
    const element = await mountPlayer('mini')
    element.chrome = 'none'

    await expect.poll(() => element.shadowRoot?.querySelector('[part="layout"]')).toBeNull()
    expect(element.shadowRoot?.querySelector('audio')).not.toBeNull()

    element.setAttribute('chrome', 'expanded')
    await expect.poll(() => element.shadowRoot?.querySelector('.expanded')).not.toBeNull()
  })

  it('falls back to the bar for an unknown chrome value', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()
    const element = document.createElement(BITRATE_PLAYER_TAG_NAME)
    element.setAttribute('chrome', 'sidebar')
    document.body.append(element)

    await expect.poll(() => element.shadowRoot?.querySelector('.root')).not.toBeNull()
  })
})
