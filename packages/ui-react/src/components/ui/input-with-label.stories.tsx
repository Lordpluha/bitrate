import type { Meta, StoryObj } from '@storybook/react-vite'

import { InputWithLabel } from './input-with-label'

/**
 * Input field with a floating label.
 */
const meta = {
  title: 'ui/InputWithLabel',
  component: InputWithLabel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    className: 'w-96',
    type: 'email',
    placeholder: '',
    label: 'Email Address',
  },
} satisfies Meta<typeof InputWithLabel>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Basic usage of the input with a floating label.
 */
export const Default: Story = {}

/**
 * Use the `disabled` prop to make the field non-interactive.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

/**
 * Contrast variant for dark backgrounds.
 */
export const Contrast: Story = {
  render: (args) => (
    <div className="bg-contrast p-6 rounded-lg">
      <InputWithLabel {...args} />
    </div>
  ),
  args: {
    variant: 'contrast',
    labelProps: {
      variant: 'contrast',
    },
    label: 'Username',
    type: 'text',
  },
}

/**
 * Example with helper text below the field.
 */
export const WithHelperText: Story = {
  render: (args) => (
    <div className="space-y-2">
      <InputWithLabel {...args} />
      <p className="text-foreground/60 text-sm">We will never share your email.</p>
    </div>
  ),
  args: {
    label: 'Email',
    type: 'email',
  },
}
