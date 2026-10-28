import type { Meta, StoryObj } from '@storybook/svelte-vite'
import { fn } from 'storybook/test'
import ComposedPlayerHost from './stories/ComposedPlayerHost.svelte'
import { resolveSilentSource, SINGLE_RENDITION } from './stories/fixtures'

/**
 * A host-built layout: part elements inside `<bitrate-player>` replace the built-in `chrome`,
 * and each control still renders only when the root has its callback.
 */
const meta = {
  title: 'Player/Composed from parts',
  component: ComposedPlayerHost,
  tags: ['autodocs'],
  argTypes: {
    renditions: { control: 'object' },
    resolveSource: { control: false },
  },
  args: {
    renditions: SINGLE_RENDITION,
    resolveSource: resolveSilentSource,
    trackTitle: 'Night Drive',
    artist: 'Neon Avenue',
    onNext: fn(),
    onPrevious: fn(),
    onLikeToggle: fn(),
    onQueueOpen: fn(),
  },
} satisfies Meta<typeof ComposedPlayerHost>

export default meta
type Story = StoryObj<typeof meta>

/** A card: cover, title, a thin seek line, Like · Previous/Play/Next · Queue. */
export const Card: Story = {}

/** Without `onPrevious` and `onQueueOpen` the card drops those buttons on its own. */
export const FewerCallbacks: Story = {
  args: { onPrevious: undefined, onQueueOpen: undefined },
}
