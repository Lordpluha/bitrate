// The "00E • Page Blocks" library page: every block in a cell sized like its real use on screens.
import { C, T, P, H, F, Row, Col } from '../kit.mjs'
import { cellOf, stableId } from './engine.mjs'

/* lay the page out. A block whose root width follows its parent (fill_container) gets a cell as wide as it is
   used on screens, so the library shows it at its real size instead of collapsed; rows are packed by width,
   not by a fixed count, so small controls and full-width blocks don't share a ragged row */
const CELL = { medium: 480, wide: 960 }
const cellWidth = (b) => {
  if (typeof b.width === 'number') return b.width
  if (b.width !== 'fill_container') return 240
  if (/Mobile/.test(b.name)) return 358
  return CELL[cellOf(b)] ?? 360
}
const ROW_BUDGET = 1800
/** Packs `blocks` into rows of cells by width and returns the page frame. */
export const blocksPage = (blocks) => {
  const rows = []
  let line = []
  let used = 0
  const flush = () => {
    if (!line.length) return
    rows.push(Row({ name: `Blocks Row ${rows.length + 1}`, gap: 48, alignItems: 'start' }, line))
    line = []
    used = 0
  }
  for (const b of blocks) {
    const w = cellWidth(b)
    if (used && used + w > ROW_BUDGET) flush()
    const fluid = b.width === 'fill_container'
    line.push(
      Col({ name: `Cell / ${b.name}`, gap: 12, ...(fluid ? { width: w } : {}) }, [
        T(b.name, { fontSize: 12, fill: C.mutedForeground }),
        b,
      ]),
    )
    used += w + 48
  }
  flush()
  return F(
    { name: '00E • Page Blocks', layout: 'vertical', gap: 56, padding: 64, fill: C.background },
    [
      H('Page blocks', 40, { fontWeight: '700' }),
      P(
        'Composites every screen is built from. Screens use only these and the shadcn kit — nothing is drawn locally.',
        { width: 720 },
      ),
      ...rows,
    ],
  )
}
/* the page's own layout frames (rows, cells, captions) get stable ids; components keep theirs. Stamp
   it after every other id so none of those shift */
export const stampLayout = (page) => {
  const visit = (n, path) => {
    if (!n || typeof n !== 'object' || n.reusable) return
    if (n.id) n.id = stableId(`page:00E Page Blocks/${path}`)
    ;(n.children ?? []).forEach((c, i) => {
      visit(c, `${path}.${i}`)
    })
  }
  visit(page, '0')
}
