import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BrowseCategoryGrid } from './BrowseCategoryGrid'

const browseCategories = vi.hoisted(() => ({
  current: {} as Record<string, unknown>,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/entities/Discovery', () => ({
  useBrowseCategories: () => browseCategories.current,
}))

const loaded = (data: unknown[]) => ({
  data: { data },
  isError: false,
  isPending: false,
  refetch: vi.fn(),
})

describe('BrowseCategoryGrid', () => {
  beforeEach(() => {
    browseCategories.current = loaded([])
  })

  it('shows the empty state when there are no categories to browse', () => {
    render(<BrowseCategoryGrid />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Nothing to browse yet',
    )
    expect(screen.queryByText('Browse all')).not.toBeInTheDocument()
  })

  it('lists the categories under Browse all when there are some', () => {
    browseCategories.current = loaded([
      { color: '#123456', id: 'c1', name: 'Ambient', slug: 'ambient' },
    ])

    render(<BrowseCategoryGrid />)

    expect(screen.getByText('Browse all')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ambient' })).toBeInTheDocument()
    expect(screen.queryByText('Nothing to browse yet')).not.toBeInTheDocument()
  })
})
