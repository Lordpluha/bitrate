import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies the default variant border class', () => {
    render(<Button>Default</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-white')
  })

  it('applies the destructive variant class', () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-500')
  })

  it('applies the primary variant class', () => {
    render(<Button variant="primary">Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-green-500')
  })

  it('applies a size class', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-11')
  })

  it('renders a loading spinner when isLoading is set', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('calls onClick handler', () => {
    const handler = vi.fn()
    render(<Button onClick={handler}>Click</Button>)
    screen.getByRole('button').click()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders as a child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/home" aria-label="Go to home page">
          Home
        </a>
      </Button>,
    )
    expect(screen.getByRole('link', { name: 'Go to home page' })).toHaveAttribute('href', '/home')
  })

  it('applies the outline variant class', () => {
    render(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border')
  })

  it('applies the secondary variant class', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-slate-800')
  })

  it('applies the ghost variant class', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('hover:bg-bg-secondary')
  })

  it('applies the contrast variant class', () => {
    render(<Button variant="contrast">Contrast</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-contrast')
  })

  it('applies the link variant class', () => {
    render(<Button variant="link">Link</Button>)
    expect(screen.getByRole('button')).toHaveClass('underline-offset-4')
  })

  it('applies the sm size class', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-9')
  })

  it('applies the icon size class', () => {
    render(
      <Button size="icon" aria-label="icon">
        🔍
      </Button>,
    )
    expect(screen.getByRole('button')).toHaveClass('w-10')
  })
})
