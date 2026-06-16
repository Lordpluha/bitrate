import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './empty'

describe('Empty snapshots', () => {
  it('matches snapshot — full composition', () => {
    const { container } = render(
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Nothing here</EmptyTitle>
          <EmptyDescription>Try again later</EmptyDescription>
        </EmptyHeader>
      </Empty>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('renders EmptyMedia icon variant', () => {
    const { container } = render(
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">⭐</EmptyMedia>
          <EmptyTitle>No results</EmptyTitle>
        </EmptyHeader>
      </Empty>,
    )
    expect(container).toMatchSnapshot()
  })
})
