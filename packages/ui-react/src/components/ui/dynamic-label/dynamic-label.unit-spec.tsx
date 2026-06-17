import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InputProvider } from '../input-context'
import { DynamicLabel } from './dynamic-label'

describe('DynamicLabel', () => {
  it('renders its children', () => {
    render(<DynamicLabel>Email</DynamicLabel>)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('starts in the idle (non-floating) state without context', () => {
    render(<DynamicLabel>Email</DynamicLabel>)
    const label = screen.getByText('Email')
    expect(label).toHaveClass('top-1/2')
  })

  it('associates with an input via htmlFor', () => {
    render(<DynamicLabel htmlFor="email">Email</DynamicLabel>)
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email')
  })

  it('applies the default variant background', () => {
    render(<DynamicLabel variant="default">Email</DynamicLabel>)
    expect(screen.getByText('Email')).toHaveClass('bg-white')
  })

  it('applies the contrast variant background', () => {
    render(<DynamicLabel variant="contrast">Email</DynamicLabel>)
    expect(screen.getByText('Email')).toHaveClass('bg-contrast')
  })

  it('applies the search variant class', () => {
    render(
      <InputProvider>
        <DynamicLabel htmlFor="x" variant="search">
          Label
        </DynamicLabel>
      </InputProvider>,
    )
    expect(screen.getByText('Label')).toHaveClass('bg-white')
  })
})
