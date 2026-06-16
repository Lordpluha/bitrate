import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

describe('Popover screenshots', () => {
  it('open', async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    )
    await expect(page.elementLocator(document.body)).toMatchScreenshot()
  })
})
