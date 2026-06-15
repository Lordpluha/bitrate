import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Kbd, KbdGroup } from './kbd'

describe('Kbd snapshots', () => {
  it('matches snapshot — single key', () => {
    const { container } = render(<Kbd>Ctrl</Kbd>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — group', () => {
    const { container } = render(
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
