import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from './spinner'

describe('Spinner', () => {
  it('renders with the status role', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has an accessible label', () => {
    render(<Spinner />)
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('applies the spin animation class', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveClass('animate-spin')
  })

  it('merges a custom className', () => {
    render(<Spinner className="size-8" />)
    expect(screen.getByRole('status')).toHaveClass('size-8')
  })
})
