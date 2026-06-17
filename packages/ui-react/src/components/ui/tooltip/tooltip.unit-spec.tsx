import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

describe('Tooltip', () => {
  it('renders the trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('does not show the content by default', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Hidden tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(screen.queryByText('Hidden tip')).not.toBeInTheDocument()
  })

  it('renders content when defaultOpen', () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Visible tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    // Radix renders the content (often duplicated for a11y) when open.
    expect(screen.getAllByText('Visible tip').length).toBeGreaterThan(0)
  })
})
