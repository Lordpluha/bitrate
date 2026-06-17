import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Separator } from './separator'

describe('Separator snapshots', () => {
  it('matches snapshot — horizontal', () => {
    const { container } = render(<Separator />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — vertical', () => {
    const { container } = render(<Separator orientation="vertical" />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
