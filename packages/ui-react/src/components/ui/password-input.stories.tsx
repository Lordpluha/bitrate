import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from './button'
import { Label } from './label'
import { PasswordInput } from './password-input'

/**
 * A password input field with toggle visibility functionality.
 * Extends the regular Input component with show/hide password capability.
 */
const meta = {
  title: 'ui/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  argTypes: {
    showPassword: {
      control: 'boolean',
      description: 'Controls password visibility (controlled mode)',
    },
    onTogglePassword: {
      action: 'togglePassword',
      description: 'Callback when toggle button is clicked',
    },
  },
  args: {
    className: 'w-96',
    placeholder: 'Enter your password',
    disabled: false,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PasswordInput>

export default meta

type Story = StoryObj<typeof meta>

/**
 * The default password input with internal state management for show/hide.
 */
export const Default: Story = {}

/**
 * Password input for contrast backgrounds (e.g., dark forms).
 */
export const contrast: StoryObj = {
  render: (args) => (
    <div className="bg-contrast p-4">
      <PasswordInput {...args} />
    </div>
  ),
  args: {
    placeholder: 'Password',
    variant: 'contrast',
  },
}

/**
 * Disabled password input that cannot be interacted with.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'disabled123',
  },
}

/**
 * Password input with a descriptive label.
 */
export const WithLabel: Story = {
  render: (args) => (
    <div className="grid items-center gap-1.5">
      <Label htmlFor="password">Password</Label>
      <PasswordInput {...args} id="password" />
    </div>
  ),
}

/**
 * Password input with helper text providing additional guidance.
 */
export const WithHelperText: Story = {
  render: (args) => (
    <div className="grid items-center gap-1.5">
      <Label htmlFor="password-2">Password</Label>
      <PasswordInput {...args} id="password-2" />
      <p className="text-foreground/60 text-sm">
        Must be at least 8 characters with special symbols.
      </p>
    </div>
  ),
}

/**
 * Password input integrated with a form submission button.
 */
export const WithButton: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <PasswordInput {...args} />
      <Button type="submit">Login</Button>
    </div>
  ),
}

/**
 * Controlled password input where visibility state is managed externally.
 */
export const Controlled: Story = {
  render: function ControlledPasswordInput(args) {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="grid items-center gap-1.5">
        <Label htmlFor="controlled-password">Controlled Password</Label>
        <PasswordInput
          {...args}
          id="controlled-password"
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />
        <p className="text-foreground/60 text-sm">
          Password is {showPassword ? 'visible' : 'hidden'}
        </p>
      </div>
    )
  },
}

/**
 * Confirm password scenario with two password inputs.
 */
export const ConfirmPassword: Story = {
  render: (args) => (
    <div className="grid items-center gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="password-new">New Password</Label>
        <PasswordInput {...args} id="password-new" placeholder="Enter new password" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password-confirm">Confirm Password</Label>
        <PasswordInput {...args} id="password-confirm" placeholder="Confirm new password" />
      </div>
    </div>
  ),
}

/**
 * Password input with custom icons instead of default eye icons.
 */
export const WithCustomIcons: Story = {
  render: (args) => (
    <div className="grid items-center gap-1.5">
      <Label htmlFor="custom-password">Password with Custom Icons</Label>
      <PasswordInput
        {...args}
        id="custom-password"
        placeholder="Enter password"
        showIcon={<span style={{ fontSize: '12px' }}>👀</span>}
        hideIcon={<span style={{ fontSize: '12px' }}>🙈</span>}
      />
      <p className="text-foreground/60 text-sm">
        Uses custom emoji icons instead of default eye icons.
      </p>
    </div>
  ),
}

export const ShouldToggleVisibility: Story = {
  name: 'when user clicks toggle button, should show/hide password',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText(/password/i)
    const toggleButton = canvas.getByRole('button')
    const testPassword = 'secretPassword123'

    await step('enter password', async () => {
      await userEvent.click(input)
      await userEvent.type(input, testPassword)
    })

    await step('password should be hidden initially', async () => {
      await expect(input).toHaveAttribute('type', 'password')
      await expect(input).toHaveValue(testPassword)
    })

    await step('click toggle to show password', async () => {
      await userEvent.click(toggleButton)
      await expect(input).toHaveAttribute('type', 'text')
    })

    await step('click toggle to hide password again', async () => {
      await userEvent.click(toggleButton)
      await expect(input).toHaveAttribute('type', 'password')
    })
  },
}
