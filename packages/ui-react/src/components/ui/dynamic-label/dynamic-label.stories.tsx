import type { StoryObj, StrictMeta } from '@storybook/react-vite'
import type { ChangeEvent, FC, FocusEvent } from 'react'
import { Input, type InputProps } from '../input'
import { InputProvider, useInputContext } from '../input-context'
import { PasswordInput, type PasswordInputProps } from '../password-input'
import { DynamicLabel } from './dynamic-label'

const InputWithContext: FC<InputProps> = ({ className, type, variant, ...props }) => {
  const context = useInputContext()
  if (!context) throw new Error('InputWithContext must be used within InputProvider')
  const { setFocused, setValue } = context

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    props.onFocus?.(e)
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    setValue(!!e.target.value)
    props.onBlur?.(e)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(!!e.target.value)
    props.onChange?.(e)
  }

  return (
    <Input
      type={type}
      className={className}
      variant={variant}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      {...props}
    />
  )
}

const PasswordInputWithContext: FC<PasswordInputProps> = ({ className, ...props }) => {
  const context = useInputContext()
  if (!context) throw new Error('PasswordInputWithContext must be used within InputProvider')
  const { setFocused, setValue } = context

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    props.onFocus?.(e)
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    setValue(!!e.target.value)
    props.onBlur?.(e)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(!!e.target.value)
    props.onChange?.(e)
  }

  return (
    <PasswordInput
      className={className}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      {...props}
    />
  )
}

/**
 * A dynamic floating label that can be used as a drop-in replacement for regular labels.
 * Just replace your regular <label> with <DynamicLabel> and get floating effect automatically.
 */
const meta = {
  title: 'ui/DynamicLabel',
  component: DynamicLabel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies StrictMeta<typeof DynamicLabel>

export default meta

type Story = StoryObj<typeof DynamicLabel>

/**
 * Basic usage - just replace your regular label with DynamicLabel
 */
export const WithInput: Story = {
  render: () => (
    <InputProvider>
      <div className="relative w-96">
        <DynamicLabel htmlFor="email-input">Email Address</DynamicLabel>
        <InputWithContext id="email-input" type="email" placeholder="" />
      </div>
    </InputProvider>
  ),
}

/**
 * Usage with PasswordInput
 */
export const WithPasswordInput: Story = {
  render: () => (
    <InputProvider>
      <div className="relative w-96">
        <DynamicLabel htmlFor="password-input">Password</DynamicLabel>
        <PasswordInputWithContext id="password-input" placeholder="" />
      </div>
    </InputProvider>
  ),
}

/**
 * Contrast variant for dark backgrounds
 */
export const Contrast: Story = {
  render: () => (
    <InputProvider>
      <div className="bg-contrast p-8 rounded-lg">
        <div className="relative w-96">
          <DynamicLabel htmlFor="username-input" variant="contrast">
            Username
          </DynamicLabel>
          <InputWithContext id="username-input" variant="contrast" placeholder="" />
        </div>
      </div>
    </InputProvider>
  ),
}

/**
 * Search variant — floats inside a rounded search input.
 */
export const Search: Story = {
  render: () => (
    <InputProvider>
      <div className="relative w-96">
        <DynamicLabel htmlFor="search-input" variant="search">
          Search tracks
        </DynamicLabel>
        <InputWithContext id="search-input" variant="search" placeholder="" />
      </div>
    </InputProvider>
  ),
}

/**
 * Form example showing how to integrate with existing forms
 */
export const FormExample: Story = {
  render: () => (
    <InputProvider>
      <form className="space-y-6 w-96">
        <div className="relative">
          <DynamicLabel htmlFor="form-name">Full Name</DynamicLabel>
          <InputWithContext id="form-name" placeholder="" />
        </div>

        <div className="relative">
          <DynamicLabel htmlFor="form-email">Email Address</DynamicLabel>
          <InputWithContext id="form-email" type="email" placeholder="" />
        </div>

        <div className="relative">
          <DynamicLabel htmlFor="form-password">Password</DynamicLabel>
          <PasswordInputWithContext id="form-password" placeholder="" />
        </div>
      </form>
    </InputProvider>
  ),
}
