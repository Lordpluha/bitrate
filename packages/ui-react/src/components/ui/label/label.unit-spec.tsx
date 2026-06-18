import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from './label'

describe('Label', () => {
  it('renders its children', () => {
    render(<Label>Email</Label>)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('associates with a control via htmlFor', () => {
    render(<Label htmlFor="email">Email</Label>)
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email')
  })

  it('applies the base label classes', () => {
    render(<Label>Email</Label>)
    expect(screen.getByText('Email')).toHaveClass('font-medium')
  })

  it('merges a custom className', () => {
    render(<Label className="custom">Email</Label>)
    expect(screen.getByText('Email')).toHaveClass('custom')
  })
})
