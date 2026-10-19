import cover1 from '@assets/images/cover-1.webp'
import type { StoryObj, StrictMeta } from '@storybook/react-vite'

import { Avatar, AvatarFallback, AvatarImage } from './avatar'

/**
 * An image element with a fallback for representing the user.
 */
const meta = {
  title: 'ui/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {},
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={cover1} />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies StrictMeta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

/**
 * The default form of the avatar.
 */
export const Default: Story = {}
