import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PasswordInput } from './password-input'

describe('PasswordInput', () => {
  it('renders a password input by default', () => {
    render(<PasswordInput placeholder="Password" />)
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')
  })

  it('renders a toggle button', () => {
    render(<PasswordInput />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows the text type when controlled showPassword is true', () => {
    render(<PasswordInput showPassword placeholder="Password" />)
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'text')
  })

  it('renders a custom show icon', () => {
    render(<PasswordInput showIcon={<span data-testid="custom-icon" />} />)
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('keeps the toggle button out of the tab order', () => {
    render(<PasswordInput />)
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '-1')
  })
})
