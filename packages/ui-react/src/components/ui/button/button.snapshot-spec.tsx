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
})
