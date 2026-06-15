import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Item, ItemContent, ItemDescription, ItemTitle } from './item'

describe('Item screenshots', () => {
  it('default', async () => {
    render(
      <div data-testid="subject" style={{ width: 320 }}>
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Song name</ItemTitle>
            <ItemDescription>Artist name</ItemDescription>
          </ItemContent>
        </Item>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('item-default')
  })
})
