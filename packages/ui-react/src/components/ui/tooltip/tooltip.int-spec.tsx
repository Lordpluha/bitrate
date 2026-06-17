import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

describe('Tooltip integration', () => {
  it('shows the tooltip content on focus', async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Helpful tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(screen.queryByText('Helpful tip')).not.toBeInTheDocument()
    await userEvent.tab()
    await waitFor(() => expect(screen.getAllByText('Helpful tip').length).toBeGreaterThan(0))
  })
})
