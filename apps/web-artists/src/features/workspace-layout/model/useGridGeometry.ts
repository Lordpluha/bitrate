import { motionReduced } from '@shared/lib/motion'
import { useCallback, useLayoutEffect, useRef } from 'react'
import { type LayoutTile, rowsForHeight } from './layout'

type Bounds = Map<HTMLElement, DOMRect>

/** Measures automatic row spans and animates the layout from its previous visible geometry. */
export function useGridGeometry(
  tiles: readonly LayoutTile[],
  editing: boolean,
  enabled: boolean,
) {
  const gridRef = useRef<HTMLDivElement>(null)
  const previous = useRef<Bounds | null>(null)
  const animations = useRef(new Map<HTMLElement, Animation>())
  const capture = useCallback(() => {
    const grid = gridRef.current
    if (!grid || motionReduced()) return
    previous.current = new Map(
      Array.from(grid.children)
        .filter((node): node is HTMLElement => node instanceof HTMLElement)
        .map((node) => [node, node.getBoundingClientRect()]),
    )
  }, [])
  const measure = useCallback(() => {
    const grid = gridRef.current
    if (!grid) return
    const style = getComputedStyle(grid)
    const hasRowGrid = Number.parseFloat(style.gridAutoRows) === 1
    const rowHeight = Number.parseFloat(
      style.getPropertyValue('--layout-row-height'),
    )
    const gap = Number.parseFloat(style.columnGap) || 0
    const nodes = Array.from(grid.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    )
    const before =
      previous.current ??
      new Map(nodes.map((node) => [node, node.getBoundingClientRect()]))
    previous.current = null
    for (const animation of animations.current.values()) animation.cancel()
    animations.current.clear()
    if (hasRowGrid && Number.isFinite(rowHeight) && rowHeight > 0) {
      // Measure intrinsic content without its currently stretched grid height. The class is
      // removed before paint; observers see only the final layout, so Auto can also shrink.
      grid.classList.add('artist-layout-measuring')
      let spans: Array<readonly [HTMLElement, number]>
      try {
        spans = nodes.map((node) => {
          const body = node.querySelector<HTMLElement>(
            ':scope > .artist-layout-content',
          )
          const toolbar = node.querySelector<HTMLElement>(
            ':scope > .artist-layout-toolbar',
          )
          const box = getComputedStyle(node)
          const chrome =
            (toolbar?.offsetHeight ?? 0) +
            (toolbar ? Number.parseFloat(box.rowGap) || 0 : 0) +
            (Number.parseFloat(box.paddingTop) || 0) +
            (Number.parseFloat(box.paddingBottom) || 0) +
            (Number.parseFloat(box.borderTopWidth) || 0) +
            (Number.parseFloat(box.borderBottomWidth) || 0)
          const rows =
            Number(node.dataset.rows) ||
            rowsForHeight(body?.offsetHeight ?? 0, rowHeight, gap)
          const contentHeight = rows * (rowHeight + gap) - gap
          // Pixel tracks keep toolbar chrome outside the requested content height. A bottom
          // margin supplies the visual grid gap without multiplying it for every pixel row.
          return [node, Math.ceil(contentHeight + chrome + gap)] as const
        })
      } finally {
        grid.classList.remove('artist-layout-measuring')
      }
      for (const [node, span] of spans)
        node.style.setProperty('--layout-row-span', String(span))
    } else {
      for (const node of nodes) node.style.removeProperty('--layout-row-span')
    }
    if (motionReduced()) return
    for (const node of nodes) {
      const from = before.get(node)
      const to = node.getBoundingClientRect()
      if (!from || !to.width || !to.height || !from.width || !from.height)
        continue
      if (
        Math.abs(from.x - to.x) +
          Math.abs(from.y - to.y) +
          Math.abs(from.width - to.width) +
          Math.abs(from.height - to.height) <
        1
      )
        continue
      const animation = node.animate(
        [
          {
            translate: `${from.x - to.x}px ${from.y - to.y}px`,
            scale: `${from.width / to.width} ${from.height / to.height}`,
          },
          { translate: '0px 0px', scale: '1 1' },
        ],
        { duration: 180, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      )
      animations.current.set(node, animation)
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: dimensions and editing chrome change the DOM geometry to measure.
  useLayoutEffect(() => {
    if (!enabled) return
    measure()
  }, [tiles, editing, enabled, measure])

  // biome-ignore lint/correctness/useExhaustiveDependencies: switching editing mode replaces the observed tile elements.
  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!enabled || !grid || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(grid)
    for (const node of grid.children) {
      const body = node.querySelector(':scope > .artist-layout-content')
      const toolbar = node.querySelector(':scope > .artist-layout-toolbar')
      if (body) observer.observe(body)
      if (toolbar) observer.observe(toolbar)
    }
    return () => {
      observer.disconnect()
      for (const animation of animations.current.values()) animation.cancel()
      animations.current.clear()
      previous.current = null
    }
  }, [enabled, editing, measure])
  return { gridRef, capture }
}
