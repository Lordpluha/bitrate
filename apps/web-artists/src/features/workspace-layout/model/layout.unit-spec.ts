import { describe, expect, it } from 'vitest'
import {
  columnsAfterDrag,
  defaultLayout,
  mergeLayout,
  rowsForHeight,
  sameLayout,
  storedLayoutSchema,
  type TileDefinition,
  tileColumns,
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

describe('twelve-column layouts', () => {
  it('keeps custom widths even when the old preset is unavailable', () => {
    const stored = [
      { id: 'current', size: 'S' as const, columns: 3, hidden: false },
    ]
    expect(mergeLayout(definitions, stored)[0]).toEqual({
      ...stored[0],
      size: 'M',
    })
  })

  it('preserves the geometry of legacy presets', () => {
    expect(
      ['S', 'M', 'L'].map((size) =>
        tileColumns({ size: size as 'S' | 'M' | 'L' }),
      ),
    ).toEqual([4, 8, 12])
    expect(tileColumns({ size: 'S' }, 'halves')).toBe(6)
    expect(tileColumns({ size: 'M' }, 'halves')).toBe(12)
    expect(tileColumns({ size: 'L', columns: 7 })).toBe(7)
  })

  it('recognizes explicit default widths and detects resized layouts', () => {
    const defaults = defaultLayout(definitions)
    expect(
      sameLayout(
        defaults,
        defaults.map((tile) => ({ ...tile, columns: tileColumns(tile) })),
      ),
    ).toBe(true)
    expect(
      sameLayout(
        defaults,
        defaults.map((tile) => ({ ...tile, columns: 7 })),
      ),
    ).toBe(false)
  })

  it('snaps dragging to columns and clamps both edges', () => {
    expect(columnsAfterDrag(6, 49, 100)).toBe(6)
    expect(columnsAfterDrag(6, 51, 100)).toBe(7)
    expect(columnsAfterDrag(6, -151, 100)).toBe(4)
    expect(columnsAfterDrag(6, -2000, 100)).toBe(1)
    expect(columnsAfterDrag(6, 2000, 100)).toBe(12)
  })

  it('rejects fractional, out-of-range and incorrectly typed saved widths', () => {
    for (const columns of [0, 13, 1.5, '6', null])
      expect(
        storedLayoutSchema.safeParse({
          tiles: [{ id: 'activity', size: 'S', hidden: false, columns }],
        }).success,
      ).toBe(false)
  })
})

describe('two-dimensional layouts', () => {
  it('preserves fixed heights and detects returning to automatic height', () => {
    const stored = [
      { id: 'current', size: 'M' as const, columns: 5, rows: 7, hidden: false },
    ]
    expect(mergeLayout(definitions, stored)[0]).toEqual(stored[0])
    expect(sameLayout(stored, [{ ...stored[0], rows: undefined }])).toBe(false)
    expect(storedLayoutSchema.parse({ tiles: stored }).tiles).toEqual(stored)
  })
  it('rejects malformed heights while allowing legacy automatic heights', () => {
    const base = { id: 'current', size: 'M', hidden: false }
    expect(storedLayoutSchema.safeParse({ tiles: [base] }).success).toBe(true)
    for (const rows of [0, 13, -1, 1.5, '4', null])
      expect(
        storedLayoutSchema.safeParse({ tiles: [{ ...base, rows }] }).success,
      ).toBe(false)
  })
  it('includes gaps when fitting the natural height to the grid', () => {
    expect(rowsForHeight(64, 64, 20)).toBe(1)
    expect(rowsForHeight(65, 64, 20)).toBe(2)
    expect(rowsForHeight(148, 64, 20)).toBe(2)
    expect(rowsForHeight(149, 64, 20)).toBe(3)
  })
})
