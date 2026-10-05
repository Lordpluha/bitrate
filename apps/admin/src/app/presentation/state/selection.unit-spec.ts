import { describe, expect, it } from 'vitest'
import { createSelection } from './selection'

describe('createSelection', () => {
  it('toggles a single id on and off', () => {
    const selection = createSelection({ limit: 10 })

    selection.toggle('a')
    expect(selection.ids()).toEqual(['a'])
    expect(selection.has('a')).toBe(true)

    selection.toggle('a')
    expect(selection.ids()).toEqual([])
    expect(selection.count()).toBe(0)
  })

  it('selects every id on the page, then clears them when all are already selected', () => {
    const selection = createSelection({ limit: 10 })

    selection.toggleAll(['a', 'b', 'c'])
    expect(selection.ids()).toEqual(['a', 'b', 'c'])
    expect(selection.allSelected(['a', 'b', 'c'])).toBe(true)

    selection.toggleAll(['a', 'b', 'c'])
    expect(selection.ids()).toEqual([])
  })

  it('completes a partial selection to all ids instead of clearing it', () => {
    const selection = createSelection({ limit: 10 })
    selection.toggle('a')

    selection.toggleAll(['a', 'b'])

    expect(selection.ids()).toEqual(['a', 'b'])
  })

  it('never selects more than the limit', () => {
    const selection = createSelection({ limit: 2 })

    selection.toggleAll(['a', 'b', 'c'])
    expect(selection.ids()).toEqual(['a', 'b'])

    selection.toggle('c')
    expect(selection.ids()).toEqual(['a', 'b'])
  })

  it('reports an empty page as not all-selected', () => {
    expect(createSelection({ limit: 2 }).allSelected([])).toBe(false)
  })

  it('clears every selection', () => {
    const selection = createSelection({ limit: 10 })
    selection.toggleAll(['a', 'b'])

    selection.clear()

    expect(selection.count()).toBe(0)
  })
})
