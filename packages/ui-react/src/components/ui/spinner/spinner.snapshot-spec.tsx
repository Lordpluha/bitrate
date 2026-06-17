import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from './spinner'

describe('Spinner snapshots', () => {
  it('matches snapshot — default', () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — custom size', () => {
    const { container } = render(<Spinner className="size-8" />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
