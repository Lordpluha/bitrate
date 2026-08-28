import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HoverCard, HoverCardTrigger } from './hover-card'

describe('HoverCard snapshots', () => {
  it('matches snapshot — trigger only', () => {
    const { container } = render(
      <HoverCard>
        <HoverCardTrigger>Artist</HoverCardTrigger>
      </HoverCard>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
