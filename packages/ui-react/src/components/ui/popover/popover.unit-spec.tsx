import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

describe('Popover', () => {
  it('renders the trigger', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    )
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('keeps content closed by default', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Hidden body</PopoverContent>
      </Popover>,
    )
    expect(screen.queryByText('Hidden body')).not.toBeInTheDocument()
  })

  it('renders content when open by default', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Visible body</PopoverContent>
      </Popover>,
    )
    expect(screen.getByText('Visible body')).toBeInTheDocument()
  })
})
