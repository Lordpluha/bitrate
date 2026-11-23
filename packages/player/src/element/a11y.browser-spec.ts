import axe from 'axe-core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BITRATE_PLAYER_CHROMES, type BitratePlayerElement, type PlayerChrome } from '../contract'

/**
 * The player's accessibility gate (ACCESSIBILITY.md, D-3): every built-in layout, with a track
 * loaded, through axe, shadow DOM included. Colour contrast is off here: the host supplies the
 * colours through CSS custom properties, and the hosts' own axe passes check them.
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function mountPlayer(chrome: PlayerChrome): Promise<BitratePlayerElement> {
  const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
  await defineBitratePlayer()

  const element = document.createElement(BITRATE_PLAYER_TAG_NAME)
  element.setAttribute('chrome', chrome)
  element.style.width = '960px'
  document.body.append(element)

  element.trackTitle = 'Night Drive'
  element.artist = 'Neon Avenue'
  element.renditions = [
    { bitrate: 128, label: '128 kbps' },
    { bitrate: 320, label: '320 kbps' },
  ]
  element.resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
  element.onNext = vi.fn()
  element.onPrevious = vi.fn()
  element.onLikeToggle = vi.fn()
  element.onShuffleToggle = vi.fn()
  element.onRepeatToggle = vi.fn()
  element.onExpand = vi.fn()
  element.onPictureInPicture = vi.fn()
  element.onQueueOpen = vi.fn()

  if (chrome !== 'none') {
    await expect.poll(() => element.shadowRoot?.querySelector('[part="layout"]')).not.toBeNull()
  }
  return element
}

describe('<bitrate-player> accessibility', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  for (const chrome of BITRATE_PLAYER_CHROMES) {
    it(`has no WCAG A/AA violation in the ${chrome} layout`, async () => {
      await mountPlayer(chrome)

      const { violations } = await axe.run(document.body, {
        runOnly: { type: 'tag', values: WCAG_TAGS },
        rules: { 'color-contrast': { enabled: false } },
      })

      expect(
        violations.flatMap((violation) =>
          violation.nodes.map((node) => `${violation.id}: ${node.target.join(' ')}`),
        ),
      ).toEqual([])
    })
  }
})
