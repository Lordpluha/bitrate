import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FilterChips } from './FilterChips'

const chips = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
] as const

describe('FilterChips', () => {
  it('marks the active chip pressed and reports the chosen one', async () => {
    const onChange = vi.fn()
    render(
      <FilterChips
        ariaLabel="Show"
        chips={chips}
        onChange={onChange}
        value="all"
      />,
    )

    expect(screen.getByRole('group', { name: 'Show' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Music' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Music' }))
    expect(onChange).toHaveBeenCalledWith('music')
  })
})
