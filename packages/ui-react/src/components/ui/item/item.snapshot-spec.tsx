import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Item, ItemContent, ItemDescription, ItemTitle } from './item'

describe('Item snapshots', () => {
  it('matches snapshot — default', () => {
    const { container } = render(
      <Item>
        <ItemContent>
          <ItemTitle>Title</ItemTitle>
          <ItemDescription>Description</ItemDescription>
        </ItemContent>
      </Item>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — outline small', () => {
    const { container } = render(
      <Item variant="outline" size="sm">
        <ItemContent>
          <ItemTitle>Title</ItemTitle>
        </ItemContent>
      </Item>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
