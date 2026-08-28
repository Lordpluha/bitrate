import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'

describe('HoverCard integration', () => {
  it('reveals and hides the content as the controlled open state changes', () => {
    const view = render(
      <HoverCard open={false}>
        <HoverCardTrigger>Artist</HoverCardTrigger>
        <HoverCardContent>Monthly listeners</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.queryByText('Monthly listeners')).not.toBeInTheDocument()

    view.rerender(
      <HoverCard open>
        <HoverCardTrigger>Artist</HoverCardTrigger>
        <HoverCardContent>Monthly listeners</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getAllByText('Monthly listeners').length).toBeGreaterThan(0)

    view.rerender(
      <HoverCard open={false}>
        <HoverCardTrigger>Artist</HoverCardTrigger>
        <HoverCardContent>Monthly listeners</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.queryByText('Monthly listeners')).not.toBeInTheDocument()
  })
})
