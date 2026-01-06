import type { Meta, StoryObj } from "@storybook/react-vite"

import { Label } from "./label"

/**
 * Renders an accessible label associated with controls.
 */
const meta = {
  title: "ui/Label",
  component: Label,
  tags: ["autodocs"],
  argTypes: {
    children: {
<<<<<<< HEAD:packages/ui/src/components/ui/label.stories.tsx
      control: { type: 'text' }
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'modal', 'large']
    }
  },
  args: {
    children: 'Your email address',
    htmlFor: 'email',
    variant: 'default'
  }
=======
      control: { type: "text" },
    },
  },
  args: {
    children: "Your email address",
    htmlFor: "email",
  },
>>>>>>> develop:packages/ui-react/src/components/ui/label.stories.tsx
} satisfies Meta<typeof Label>

export default meta

type Story = StoryObj<typeof Label>

/**
 * The default form of the label.
 */
export const Default: Story = {}

/**
 * Modal variant with smaller text and bottom margin.
 */
export const Modal: Story = {
  args: {
    variant: 'modal',
    children: 'Email Address'
  }
}

/**
 * Large variant for headings or important labels.
 */
export const Large: Story = {
  args: {
    variant: 'large',
    children: 'Important Label'
  }
}
