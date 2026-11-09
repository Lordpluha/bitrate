import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('selects a page directly and identifies the current page and boundaries', async () => {
    const onPage = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(
      <Pagination label="Tracks pages" onPage={onPage} page={1} pages={6} />,
    )
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await user.click(screen.getByRole('button', { name: 'Page 4' }))
    expect(onPage).toHaveBeenLastCalledWith(4)
    rerender(
      <Pagination label="Tracks pages" onPage={onPage} page={6} pages={6} />,
    )
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(onPage).toHaveBeenLastCalledWith(5)
  })

  it('keeps a large list bounded with the first, current, nearby and last pages reachable', async () => {
    const onPage = vi.fn()
    const user = userEvent.setup()
    render(
      <Pagination
        label="Tracks pages"
        onPage={onPage}
        page={50}
        pages={100_000}
      />,
    )
    expect(screen.getAllByRole('button').length).toBeLessThanOrEqual(9)
    expect(screen.getByRole('button', { name: 'Page 49' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Page 50' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('button', { name: 'Page 51' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Page 100000' }))
    expect(onPage).toHaveBeenLastCalledWith(100_000)
  })

  it('renders real links for routed pagination and marks the current link', () => {
    render(
      <Pagination
        label="Distribution pages"
        page={2}
        pages={4}
        renderLink={(page, content) => (
          <a href={`/distribution?page=${page}`}>{content}</a>
        )}
      />,
    )
    expect(screen.getByRole('link', { name: 'Page 4' })).toHaveAttribute(
      'href',
      '/distribution?page=4',
    )
    expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'href',
      '/distribution?page=1',
    )
  })

  it('handles a single page and prevents requests while loading', async () => {
    const onPage = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(
      <Pagination label="Tracks pages" onPage={onPage} page={1} pages={1} />,
    )
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Page 1' }))
    expect(onPage).not.toHaveBeenCalled()
    rerender(
      <Pagination
        disabled
        label="Tracks pages"
        onPage={onPage}
        page={2}
        pages={3}
      />,
    )
    for (const button of screen.getAllByRole('button'))
      expect(button).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(onPage).not.toHaveBeenCalled()
  })
})
