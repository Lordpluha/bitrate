import { describe, expect, it } from 'vitest'
import { edgeSwipe } from './edgeSwipe'

const list = { scrollHeight: 1200, clientHeight: 400 }

describe('edgeSwipe', () => {
  it('moves to the next scene when a list already at its end is swiped up', () => {
    expect(edgeSwipe({ ...list, dy: 90, scrollTop: 800, startTop: 800 })).toBe(
      1,
    )
  })

  it('moves to the previous scene when a list already at its top is swiped down', () => {
    expect(edgeSwipe({ ...list, dy: -90, scrollTop: 0, startTop: 0 })).toBe(-1)
  })

  it('only scrolls while the list still has room in that direction', () => {
    expect(edgeSwipe({ ...list, dy: 90, scrollTop: 300, startTop: 300 })).toBe(
      0,
    )
    expect(edgeSwipe({ ...list, dy: -90, scrollTop: 300, startTop: 300 })).toBe(
      0,
    )
  })

  it('does not flip on the swipe that scrolled the list to its edge', () => {
    expect(edgeSwipe({ ...list, dy: 200, scrollTop: 800, startTop: 600 })).toBe(
      0,
    )
  })

  it('ignores short drags, which are taps or small adjustments', () => {
    expect(edgeSwipe({ ...list, dy: 20, scrollTop: 800, startTop: 800 })).toBe(
      0,
    )
  })

  it('treats a list that does not scroll as being at both edges', () => {
    const short = { scrollHeight: 300, clientHeight: 400 }
    expect(edgeSwipe({ ...short, dy: 90, scrollTop: 0, startTop: 0 })).toBe(1)
    expect(edgeSwipe({ ...short, dy: -90, scrollTop: 0, startTop: 0 })).toBe(-1)
  })
})
