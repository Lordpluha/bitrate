import type { Meta, StoryObj } from '@storybook/react-vite'

import { DynamicLabel } from './dynamic-label'
import { Input } from './input'
import { PasswordInput } from './password-input'

/**
 * A dynamic floating label that can be used as a drop-in replacement for regular labels.
 * Just replace your regular <label> with <DynamicLabel> and get floating effect automatically.
 */
const meta = {
  title: 'ui/DynamicLabel',
  component: DynamicLabel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof DynamicLabel>

export default meta

type Story = StoryObj<typeof DynamicLabel>

/**
 * Basic usage - just replace your regular label with DynamicLabel
 */
export const WithInput: Story = {
  render: () => (
    <div className="relative w-96">
      <DynamicLabel htmlFor="email-input">Email Address</DynamicLabel>
      <Input
        id="email-input"
        type="email"
        placeholder=""
      />
    </div>
  )
}

/**
 * Usage with PasswordInput
 */
export const WithPasswordInput: Story = {
  render: () => (
    <div className="relative w-96">
      <DynamicLabel htmlFor="password-input">Password</DynamicLabel>
      <PasswordInput
        id="password-input"
        placeholder=""
      />
    </div>
  )
}

/**
 * Contrast variant for dark backgrounds
 */
export const Contrast: Story = {
  render: () => (
    <div className='bg-contrast p-8 rounded-lg'>
      <div className="relative w-96">
        <DynamicLabel htmlFor="username-input" variant="contrast">
          Username
        </DynamicLabel>
        <Input
          id="username-input"
          variant="contrast"
          placeholder=""
        />
      </div>
    </div>
  )
}

/**
 * Form example showing how to integrate with existing forms
 */
export const FormExample: Story = {
  render: () => (
    <form className="space-y-6 w-96">
      <div className="relative">
        <DynamicLabel htmlFor="form-name">Full Name</DynamicLabel>
        <Input id="form-name" placeholder="" />
      </div>

      <div className="relative">
        <DynamicLabel htmlFor="form-email">Email Address</DynamicLabel>
        <Input id="form-email" type="email" placeholder="" />
      </div>

      <div className="relative">
        <DynamicLabel htmlFor="form-password">Password</DynamicLabel>
        <PasswordInput id="form-password" placeholder="" />
      </div>
    </form>
  )
}
