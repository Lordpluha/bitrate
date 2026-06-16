import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from './item'

describe('Item', () => {
  it('renders a full item composition', () => {
    render(
      <Item>
        <ItemMedia variant="icon">
          <span data-testid="icon" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Song name</ItemTitle>
          <ItemDescription>Artist</ItemDescription>
        </ItemContent>
        <ItemActions>
          <button type="button">Play</button>
        </ItemActions>
      </Item>,
    )
    expect(screen.getByText('Song name')).toBeInTheDocument()
    expect(screen.getByText('Artist')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('reflects variant and size via data attributes', () => {
    const { container } = render(
      <Item variant="outline" size="sm">
        content
      </Item>,
    )
    const item = container.querySelector('[data-slot="item"]')
    expect(item).toHaveAttribute('data-variant', 'outline')
    expect(item).toHaveAttribute('data-size', 'sm')
  })

  it('renders an ItemGroup with the list role', () => {
    render(
      <ItemGroup>
        <Item>one</Item>
      </ItemGroup>,
    )
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('renders as a child element when asChild is set', () => {
    render(
      <Item asChild>
        <a href="/track">Track link</a>
      </Item>,
    )
    expect(screen.getByRole('link', { name: 'Track link' })).toHaveAttribute('href', '/track')
  })

  it('applies the muted variant class', () => {
    render(
      <Item variant="muted" data-testid="item">
        <ItemContent><ItemTitle>Muted</ItemTitle></ItemContent>
      </Item>,
    )
    expect(screen.getByTestId('item')).toHaveClass('bg-slate-100/50')
  })
})
