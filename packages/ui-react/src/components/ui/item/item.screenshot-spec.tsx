import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Item, ItemContent, ItemDescription, ItemTitle } from './item'

describe('Item screenshots', () => {
  it('all variants', async () => {
    render(
      <div
        data-testid="subject"
        style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, width: 320 }}
      >
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Song name</ItemTitle>
            <ItemDescription>Artist name</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="muted">
          <ItemContent>
            <ItemTitle>Muted Item</ItemTitle>
          </ItemContent>
        </Item>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
