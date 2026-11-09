import { act, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoadingProgress } from './LoadingProgress'

describe('LoadingProgress', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('includes the initial indicator in server HTML before hydration can run effects', () => {
    const html = renderToString(
      <LoadingProgress active initiallyVisible label="Loading page" />,
    )
    expect(html).toContain('role="progressbar"')
    expect(html).toContain('artist-route-progress-indicator')
  })

  it('waits before appearing, reports indeterminate progress, and hides as soon as loading ends', () => {
    const { rerender } = render(<LoadingProgress active label="Loading page" />)
    act(() => vi.advanceTimersByTime(149))
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1))
    expect(
      screen.getByRole('progressbar', { name: 'Loading page' }),
    ).not.toHaveAttribute('aria-valuenow')
    rerender(<LoadingProgress active={false} label="Loading page" />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('cancels a delayed indicator when loading finishes or the component unmounts', () => {
    const { rerender, unmount } = render(
      <LoadingProgress active label="Loading page" />,
    )
    rerender(<LoadingProgress active={false} label="Loading page" />)
    act(() => vi.advanceTimersByTime(200))
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    rerender(<LoadingProgress active label="Loading page" />)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
