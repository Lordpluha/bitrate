import type { StoryObj, StrictMeta } from '@storybook/react-vite'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

/**
 * A card that reveals related detail when the trigger is hovered or focused —
 * used for artist and playlist previews.
 */
const meta = {
  title: 'ui/HoverCard',
  component: HoverCardContent,
  tags: ['autodocs'],
  argTypes: {
    side: {
      options: ['left', 'right', 'bottom', 'top', 'inline-end', 'inline-start'],
      control: {
        type: 'radio',
      },
    },
  },
  args: {
    side: 'top',
    align: 'center',
    children: 'NCS — 12,4M monthly listeners',
  },
  parameters: {
    layout: 'centered',
  },
  render: (args) => (
    <HoverCard>
      <HoverCardTrigger>Artist</HoverCardTrigger>
      <HoverCardContent {...args} />
    </HoverCard>
  ),
} satisfies StrictMeta<typeof HoverCardContent>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Open: Story = {
  render: (args) => (
    <HoverCard defaultOpen>
      <HoverCardTrigger>Artist</HoverCardTrigger>
      <HoverCardContent {...args} />
    </HoverCard>
  ),
}
