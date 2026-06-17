import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Item, ItemActions, ItemContent, ItemTitle } from './item'

describe('Item integration', () => {
  it('handles action button clicks within the item', async () => {
    const handler = vi.fn()
    render(
      <Item>
        <ItemContent>
          <ItemTitle>Song</ItemTitle>
        </ItemContent>
        <ItemActions>
          <button type="button" onClick={handler}>
            Play
          </button>
        </ItemActions>
      </Item>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
