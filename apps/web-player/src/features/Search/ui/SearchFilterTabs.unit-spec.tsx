import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchFilterTabs } from './SearchFilterTabs'

describe('SearchFilterTabs', () => {
  it('moves selection and focus with arrow keys', () => {
    const onTabChange = vi.fn()

    render(
      <SearchFilterTabs
        activeTab="All"
        availableTabs={['All', 'Songs', 'Albums']}
        onTabChange={onTabChange}
      />,
    )

    const allTab = screen.getByRole('tab', { name: 'All' })
    const songsTab = screen.getByRole('tab', { name: 'Songs' })
    allTab.focus()
    fireEvent.keyDown(allTab, { key: 'ArrowRight' })

    expect(onTabChange).toHaveBeenCalledWith('Songs')
    expect(songsTab).toHaveFocus()
  })

  it('keeps only the selected tab in the tab order', () => {
    render(
      <SearchFilterTabs
        activeTab="Songs"
        availableTabs={['All', 'Songs']}
        onTabChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute(
      'tabindex',
      '-1',
    )
    expect(screen.getByRole('tab', { name: 'Songs' })).toHaveAttribute(
      'tabindex',
      '0',
    )
  })
})
