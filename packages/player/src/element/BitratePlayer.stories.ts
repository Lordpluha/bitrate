import type { Meta, StoryObj } from '@storybook/svelte-vite'
import { expect, fn, waitFor } from 'storybook/test'
import type { BitratePlayerElement } from '../contract'
import { BITRATE_PLAYER_TAG_NAME } from './index'
import BitratePlayerHost from './stories/BitratePlayerHost.svelte'
import {
  LADDER_RENDITIONS,
  resolvePending,
  resolveRejected,
  resolveSilentSource,
  SINGLE_RENDITION,
} from './stories/fixtures'

const meta = {
  title: 'Player/BitratePlayer',
  component: BitratePlayerHost,
  tags: ['autodocs'],
  argTypes: {
    repeatMode: { control: 'inline-radio', options: ['off', 'all', 'one'] },
    renditions: { control: 'object' },
    resolveSource: { control: false },
  },
  args: {
    renditions: SINGLE_RENDITION,
    resolveSource: resolveSilentSource,
    trackTitle: 'Night Drive',
    artist: 'Neon Avenue',
  },
} satisfies Meta<typeof BitratePlayerHost>

export default meta
type Story = StoryObj<typeof meta>

/** Waits for the element to upgrade and wire its engine, then starts playback as a host would. */
async function startPlayback(canvasElement: HTMLElement): Promise<BitratePlayerElement> {
  const element = await waitFor(() => {
    const found = canvasElement.querySelector(BITRATE_PLAYER_TAG_NAME)
    if (!found || !Object.hasOwn(found, 'play')) throw new Error('engine not wired yet')
    return found
  })
  element.play().catch(() => {
    /** The rejection is surfaced by the element itself; the story only asserts on that. */
  })
  return element
}

/** Transport, seek and volume only — no optional callbacks, so no optional controls. */
export const Default: Story = {}

/** More than one rendition shows the quality selector. */
export const WithQualitySelector: Story = {
  args: { renditions: LADDER_RENDITIONS },
}

/** Every optional control renders once its callback is set. */
export const FullChrome: Story = {
  args: {
    renditions: LADDER_RENDITIONS,
    onNext: fn(),
    onPrevious: fn(),
    onLikeToggle: fn(),
    onShuffleToggle: fn(),
    onRepeatToggle: fn(),
    onExpand: fn(),
    onPictureInPicture: fn(),
    onQueueOpen: fn(),
  },
}

/** The paired state props only affect controls that are already showing. */
export const ActiveToggles: Story = {
  args: {
    ...FullChrome.args,
    isLiked: true,
    isShuffled: true,
    repeatMode: 'one',
  },
}

/** No renditions: there is nothing to resolve, so Play is disabled. */
export const NoRenditions: Story = {
  args: { renditions: [], trackTitle: 'Nothing queued', artist: '' },
}

/** The resolver has not settled yet — the element is preparing the source. */
export const Preparing: Story = {
  args: { resolveSource: resolvePending },
  play: async ({ canvasElement }) => {
    const element = await startPlayback(canvasElement)
    await waitFor(() =>
      expect(element.shadowRoot?.querySelector('button[aria-label="Preparing…"]')).not.toBeNull(),
    )
  },
}

/** The resolver rejected; its message is announced through `role="alert"`. */
export const SourceError: Story = {
  args: { resolveSource: resolveRejected },
  play: async ({ canvasElement }) => {
    const element = await startPlayback(canvasElement)
    await waitFor(() =>
      expect(element.shadowRoot?.querySelector('[role="alert"]')?.textContent).toContain(
        'not available in your region',
      ),
    )
  },
}

/** Long metadata must truncate, not push the controls off the bar. */
export const LongMetadata: Story = {
  args: {
    ...FullChrome.args,
    trackTitle:
      'An Unreasonably Long Track Title That Nobody Tried At Sixty Characters (Extended Club Mix)',
    artist: 'The Orchestra Of Very Long Artist Names featuring Several Guest Vocalists',
  },
}
