import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from './empty'

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
})
