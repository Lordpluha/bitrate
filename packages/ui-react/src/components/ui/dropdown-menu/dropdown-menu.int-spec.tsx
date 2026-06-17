import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'

describe('DropdownMenu integration', () => {
  it('opens the menu when the trigger is clicked', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await userEvent.click(screen.getByText('Open'))
    await waitFor(() => {
      expect(screen.getByText('Profile', { selector: '*' })).toBeInTheDocument()
    })
  })

  it('fires the item onSelect handler', async () => {
    let selected = false
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={() => {
              selected = true
            }}
          >
            Profile
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await userEvent.click(await screen.findByText('Profile'))
    await waitFor(() => expect(selected).toBe(true))
  })
})
