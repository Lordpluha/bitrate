import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('applies the default variant classes', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default')).toHaveClass('bg-slate-900')
  })

  it('applies the secondary variant classes', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary')).toHaveClass('bg-slate-100')
  })

  it('applies the destructive variant classes', () => {
    render(<Badge variant="destructive">Danger</Badge>)
    expect(screen.getByText('Danger')).toHaveClass('bg-red-500')
  })

  it('applies the outline variant classes', () => {
    render(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toHaveClass('text-slate-950')
  })

  it('merges a custom className', () => {
    render(<Badge className="custom">Custom</Badge>)
    expect(screen.getByText('Custom')).toHaveClass('custom')
  })
})
