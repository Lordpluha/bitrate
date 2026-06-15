import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

describe('Tooltip screenshots', () => {
  it('open tooltip', async () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Helpful tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    const { base64 } = await page.screenshot({ base64: true })
    expect(base64).toMatchSnapshot('tooltip-open')
  })
})
