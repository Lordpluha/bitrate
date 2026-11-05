import { describe, expect, it } from 'vitest'
import {
  defaultLayout,
  mergeLayout,
  sameLayout,
  type TileDefinition,
} from './layout'

const definitions: TileDefinition[] = [
  { id: 'current', label: 'dashboard.current', sizes: ['M', 'L'], size: 'M' },
  {
    id: 'activity',
    label: 'dashboard.current',
    sizes: ['S', 'M', 'L'],
    size: 'S',
  },
  { id: 'listening', label: 'dashboard.current', sizes: ['S', 'M'], size: 'S' },
]

describe('mergeLayout', () => {
  it('uses the default layout when nothing is stored', () => {
    expect(mergeLayout(definitions, [])).toEqual(defaultLayout(definitions))
  })

  it("keeps the artist's order, sizes and hidden tiles", () => {
    expect(
      mergeLayout(definitions, [
        { id: 'listening', size: 'M', hidden: true },
        { id: 'current', size: 'L', hidden: false },
        { id: 'activity', size: 'S', hidden: false },
      ]),
    ).toEqual([
      { id: 'listening', size: 'M', hidden: true },
      { id: 'current', size: 'L', hidden: false },
      { id: 'activity', size: 'S', hidden: false },
    ])
  })

  it('drops tiles the page no longer has and appends new ones', () => {
    expect(
      mergeLayout(definitions, [
        { id: 'retired', size: 'L', hidden: false },
        { id: 'activity', size: 'M', hidden: false },
      ]),
    ).toEqual([
      { id: 'activity', size: 'M', hidden: false },
      { id: 'current', size: 'M', hidden: false },
      { id: 'listening', size: 'S', hidden: false },
    ])
  })

  it('falls back to the default size when a tile no longer allows the stored one', () => {
    expect(
      mergeLayout(definitions, [
        { id: 'current', size: 'S', hidden: false },
      ])[0],
    ).toEqual({ id: 'current', size: 'M', hidden: false })
  })

  it('ignores a tile listed twice', () => {
    expect(
      mergeLayout(definitions, [
        { id: 'activity', size: 'L', hidden: false },
        { id: 'activity', size: 'S', hidden: true },
      ]).filter((tile) => tile.id === 'activity'),
    ).toEqual([{ id: 'activity', size: 'L', hidden: false }])
  })
})

describe('sameLayout', () => {
  it('compares order, size and visibility', () => {
    const base = defaultLayout(definitions)
    expect(sameLayout(base, defaultLayout(definitions))).toBe(true)
    expect(sameLayout(base, [...base].reverse())).toBe(false)
    expect(
      sameLayout(
        base,
        base.map((tile, index) =>
          index === 0 ? { ...tile, hidden: true } : tile,
        ),
      ),
    ).toBe(false)
  })
})
