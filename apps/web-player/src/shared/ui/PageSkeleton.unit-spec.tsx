import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageSkeleton } from './PageSkeleton'

describe('PageSkeleton', () => {
  it('announces the page it stands in for', () => {
    render(<PageSkeleton body="tracks" labelKey="queue.loading" />)

    expect(screen.getByRole('status', { name: 'Loading queue' })).toBeVisible()
  })

  it('draws the tabs row only when asked', () => {
    const { container, rerender } = render(
      <PageSkeleton body="list" labelKey="friends.loading" />,
    )
    const withoutTabs = container.querySelectorAll('.rounded-full').length

    rerender(<PageSkeleton body="list" labelKey="friends.loading" tabs />)

    expect(container.querySelectorAll('.rounded-full')).toHaveLength(
      withoutTabs + 3,
    )
  })
})
