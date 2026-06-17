import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tooltip, TooltipProvider, TooltipTrigger } from './tooltip'

describe('Tooltip snapshots', () => {
  it('matches snapshot — trigger only', () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
