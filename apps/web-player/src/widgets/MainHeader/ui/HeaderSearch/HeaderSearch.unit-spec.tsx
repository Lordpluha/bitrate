import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HeaderSearch } from './HeaderSearch'

const searchMocks = vi.hoisted(() => ({
  select: vi.fn(),
  setIsFocused: vi.fn(),
  setQuery: vi.fn(),
  submit: vi.fn((event: Event) => event.preventDefault()),
}))

vi.mock('./model/useHeaderSearch', () => ({
  useHeaderSearch: () => ({
    isFocused: true,
    query: 'mix',
    recentSearches: [],
    suggestions: [
      {
        query: 'mix one',
        subtitle: 'Search',
        title: 'mix one',
        type: 'query',
      },
      {
        query: 'mix two',
        subtitle: 'Search',
        title: 'mix two',
        type: 'query',
      },
    ],
    trimmedQuery: 'mix',
    ...searchMocks,
  }),
}))

describe('HeaderSearch', () => {
  it('exposes combobox semantics and selects suggestions with the keyboard', async () => {
    const user = userEvent.setup()
    render(<HeaderSearch />)

    const input = screen.getByRole('combobox', {
      name: 'What do you want to play?',
    })
    const options = screen.getAllByRole('option')

    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toHaveAccessibleName(
      'Search suggestions',
    )

    await user.click(input)
    await user.keyboard('{ArrowDown}{ArrowDown}')

    const secondOption = options.at(1)
    expect(secondOption).toBeDefined()
    if (!secondOption) throw new Error('Expected a second search option')

    expect(input).toHaveAttribute('aria-activedescendant', secondOption.id)
    expect(secondOption).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Enter}')
    expect(searchMocks.select).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'mix two' }),
    )
  })

  it('closes on Escape and Tab without hijacking Tab navigation', () => {
    render(<HeaderSearch />)
    const input = screen.getByRole('combobox')

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(searchMocks.setIsFocused).toHaveBeenCalledWith(false)

    searchMocks.setIsFocused.mockClear()
    const tabEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Tab',
    })
    input.dispatchEvent(tabEvent)

    expect(tabEvent.defaultPrevented).toBe(false)
    expect(searchMocks.setIsFocused).toHaveBeenCalledWith(false)
  })
})
