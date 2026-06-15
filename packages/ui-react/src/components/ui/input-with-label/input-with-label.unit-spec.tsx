import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InputWithLabel } from './input-with-label'

describe('InputWithLabel', () => {
  it('renders the label text', () => {
    render(<InputWithLabel label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders an input', () => {
    render(<InputWithLabel label="Email" placeholder="you@example.com" />)
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
  })

  it('associates the label with the input via a generated id', () => {
    render(<InputWithLabel label="Email" />)
    const label = screen.getByText('Email')
    const input = screen.getByRole('textbox')
    expect(label).toHaveAttribute('for', input.getAttribute('id'))
  })

  it('respects a provided id', () => {
    render(<InputWithLabel label="Email" id="my-email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'my-email')
    expect(screen.getByText('Email')).toHaveAttribute('for', 'my-email')
  })

  it('starts with the label in the idle position', () => {
    render(<InputWithLabel label="Email" />)
    expect(screen.getByText('Email')).toHaveClass('top-1/2')
  })
})
