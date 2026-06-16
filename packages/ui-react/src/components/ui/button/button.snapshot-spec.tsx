import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'

describe('Button snapshots', () => {
  it('matches snapshot — default', () => {
    const { container } = render(<Button>Default</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — destructive variant', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — large size', () => {
    const { container } = render(<Button size="lg">Large</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — loading', () => {
    const { container } = render(<Button isLoading>Loading</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — outline variant', () => {
    const { container } = render(<Button variant="outline">Outline</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — ghost variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — secondary variant', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — contrast variant', () => {
    const { container } = render(<Button variant="contrast">Contrast</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — link variant', () => {
    const { container } = render(<Button variant="link">Link</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — disabled', () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — sm size', () => {
    const { container } = render(<Button size="sm">Small</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — icon size', () => {
    const { container } = render(<Button size="icon" aria-label="icon">🔍</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
