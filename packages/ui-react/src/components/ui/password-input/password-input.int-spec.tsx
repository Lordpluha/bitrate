import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PasswordInput } from './password-input'

describe('PasswordInput integration', () => {
  it('toggles visibility when the button is clicked (uncontrolled)', async () => {
    render(<PasswordInput placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button'))
    expect(input).toHaveAttribute('type', 'text')

    await userEvent.click(screen.getByRole('button'))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('calls onTogglePassword when provided (controlled)', async () => {
    const onToggle = vi.fn()
    render(
      <PasswordInput showPassword={false} onTogglePassword={onToggle} placeholder="Password" />,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('lets the user type a password value', async () => {
    render(<PasswordInput placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password') as HTMLInputElement
    await userEvent.type(input, 'secret')
    expect(input.value).toBe('secret')
  })
})
