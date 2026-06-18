import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './dropdown-menu'

describe('DropdownMenu', () => {
  it('renders the trigger', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('keeps the content closed by default', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Hidden Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.queryByText('Hidden Item')).not.toBeInTheDocument()
  })

  it('renders content and label when open by default', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByText('My Account', { selector: '*' })).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('renders checkbox items', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Unchecked</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByRole('menuitemcheckbox', { name: 'Checked' })).toBeInTheDocument()
  })

  it('renders radio group items', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByRole('menuitemradio', { name: 'Option A' })).toBeInTheDocument()
  })

  it('renders keyboard shortcuts', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Copy <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByText('⌘C')).toBeInTheDocument()
  })
})
