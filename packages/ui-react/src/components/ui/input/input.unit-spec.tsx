import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './input'

describe('Input', () => {
  it('renders a textbox', () => {
    render(<Input placeholder="Type here" />)
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument()
  })

  it('applies the default variant classes', () => {
    render(<Input data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveClass('bg-input-surface')
  })

  it('applies the contrast variant classes', () => {
    render(<Input variant="contrast" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveClass('bg-input-contrast-surface')
  })

  it('applies the search variant classes', () => {
    render(<Input variant="search" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveClass('rounded-full')
  })

  it('forwards the type attribute', () => {
    render(<Input type="email" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')
  })

  it('calls onChange', () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} data-testid="input" />)
    const input = screen.getByTestId('input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'x' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('can be disabled', () => {
    render(<Input disabled data-testid="input" />)
    expect(screen.getByTestId('input')).toBeDisabled()
  })
})
