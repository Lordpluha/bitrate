import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DropdownMenu, DropdownMenuTrigger } from './dropdown-menu'

describe('DropdownMenu snapshots', () => {
  it('matches snapshot — closed trigger', () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      </DropdownMenu>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
