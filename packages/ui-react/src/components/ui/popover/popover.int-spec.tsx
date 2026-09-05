import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

describe('Popover integration', () => {
  it('opens the content when the trigger is clicked', async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    )
    expect(screen.queryByText('Popover body')).not.toBeInTheDocument()
    await userEvent.click(screen.getByText('Open'))
    await waitFor(() => expect(screen.getByText('Popover body')).toBeInTheDocument())
  })

  it('closes the content on Escape', async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    )
    expect(screen.getByText('Popover body')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByText('Popover body')).not.toBeInTheDocument())
  })
})
