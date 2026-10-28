import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  type IslandSkipDirection,
  useIslandSkipGesture,
} from './useIslandSkipGesture'

type HarnessProps = {
  canSkip?: Partial<Record<IslandSkipDirection, boolean>>
  onSkip: (direction: IslandSkipDirection) => void
  onTabClick?: () => void
}

const Harness = ({ canSkip = {}, onSkip, onTabClick }: HarnessProps) => {
  const gesture = useIslandSkipGesture({
    canSkip: (direction) => canSkip[direction] ?? true,
    onSkip,
  })

  return (
    <nav
      data-direction={gesture.direction ?? ''}
      data-offset={gesture.offset}
      data-testid="island"
      {...gesture.handlers}
    >
      <button onClick={onTabClick} type="button">
        Home
      </button>
    </nav>
  )
}

const swipe = ({ dx, dy = 0 }: { dx: number; dy?: number }) => {
  const island = screen.getByTestId('island')
  fireEvent.pointerDown(island, { clientX: 200, clientY: 400, pointerId: 1 })
  fireEvent.pointerMove(island, {
    clientX: 200 + dx,
    clientY: 400 + dy,
    pointerId: 1,
  })
  return island
}

describe('useIslandSkipGesture', () => {
  it('skips to the next track when swiped left past the threshold', () => {
    const onSkip = vi.fn()
    render(<Harness onSkip={onSkip} />)

    fireEvent.pointerUp(swipe({ dx: -60 }), { pointerId: 1 })

    expect(onSkip).toHaveBeenCalledWith('next')
  })

  it('skips to the previous track when swiped right past the threshold', () => {
    const onSkip = vi.fn()
    render(<Harness onSkip={onSkip} />)

    fireEvent.pointerUp(swipe({ dx: 60 }), { pointerId: 1 })

    expect(onSkip).toHaveBeenCalledWith('prev')
  })

  it('peeks the neighbour while dragging and springs back when short', () => {
    const onSkip = vi.fn()
    render(<Harness onSkip={onSkip} />)

    const island = swipe({ dx: -30 })
    expect(island).toHaveAttribute('data-direction', 'next')
    expect(Number(island.dataset.offset)).toBeLessThan(0)

    fireEvent.pointerUp(island, { pointerId: 1 })

    expect(onSkip).not.toHaveBeenCalled()
    expect(island).toHaveAttribute('data-offset', '0')
    expect(island).toHaveAttribute('data-direction', '')
  })

  it('caps the peek at the cover width', () => {
    render(<Harness onSkip={vi.fn()} />)

    expect(Number(swipe({ dx: -300 }).dataset.offset)).toBeGreaterThanOrEqual(
      -40,
    )
  })

  it('ignores a vertical drag', () => {
    const onSkip = vi.fn()
    render(<Harness onSkip={onSkip} />)

    fireEvent.pointerUp(swipe({ dx: -50, dy: -120 }), { pointerId: 1 })

    expect(onSkip).not.toHaveBeenCalled()
  })

  it('does not skip towards a side with no track', () => {
    const onSkip = vi.fn()
    render(<Harness canSkip={{ next: false }} onSkip={onSkip} />)

    fireEvent.pointerUp(swipe({ dx: -60 }), { pointerId: 1 })

    expect(onSkip).not.toHaveBeenCalled()
  })

  it('lets a tap reach a tab but swallows the click that ends a swipe', () => {
    const onTabClick = vi.fn()
    render(<Harness onSkip={vi.fn()} onTabClick={onTabClick} />)
    const tab = screen.getByRole('button', { name: 'Home' })

    fireEvent.click(tab)
    expect(onTabClick).toHaveBeenCalledTimes(1)

    fireEvent.pointerUp(swipe({ dx: -60 }), { pointerId: 1 })
    fireEvent.click(tab)
    expect(onTabClick).toHaveBeenCalledTimes(1)
  })
})
