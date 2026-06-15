import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

describe('Popover screenshots', () => {
  it('open', async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    )
    const { base64 } = await page.screenshot({ base64: true })
    expect(base64).toMatchSnapshot('popover-open')
  })
})
