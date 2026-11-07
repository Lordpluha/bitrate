import { useI18n } from '@shared/i18n'
import { ArrowDownUp, ArrowLeftRight, MoveDiagonal2 } from 'lucide-react'
import { type KeyboardEvent, type PointerEvent, useEffect, useRef } from 'react'
import {
  clampColumns,
  columnsAfterDrag,
  type LayoutTile,
  rowsForHeight,
} from '../model/layout'

const spans = Array.from({ length: 12 }, (_, index) => index + 1)
type Axis = 'width' | 'height' | 'both'
type Size = Pick<LayoutTile, 'columns' | 'rows'>
function naturalRows(target: HTMLButtonElement) {
  const grid = target.closest<HTMLElement>('.artist-layout-grid')
  const body = target
    .closest<HTMLElement>('.artist-layout-tile')
    ?.querySelector<HTMLElement>('.artist-layout-content')
  if (!grid || !body) return 1
  const style = getComputedStyle(grid)
  return clampColumns(
    rowsForHeight(
      body.offsetHeight,
      Number.parseFloat(style.getPropertyValue('--layout-row-height')),
      Number.parseFloat(style.columnGap) || 0,
    ),
  )
}

type Gesture = {
  pointer: number
  axis: Axis
  x: number
  y: number
  start: Size
  height: number
  last: Size
  columnUnit: number
  rowUnit: number
  target: HTMLButtonElement
}

export function TileWidthControl({
  columns,
  rows,
  label,
  disabled,
  onResize,
  onResizing,
}: {
  columns: number
  rows?: number
  label: string
  disabled: boolean
  onResize: (size: Size) => void
  onResizing: (active: boolean) => void
}) {
  const { t } = useI18n()
  const gesture = useRef<Gesture | null>(null)
  const frame = useRef(0)
  const pending = useRef<Size | null>(null)
  useEffect(() => () => cancelAnimationFrame(frame.current), [])
  const flush = () => {
    frame.current = 0
    const size = pending.current
    pending.current = null
    if (size) onResize(size)
  }
  const finish = (cancel: boolean) => {
    const current = gesture.current
    if (!current) return
    gesture.current = null
    cancelAnimationFrame(frame.current)
    if (cancel) {
      pending.current = null
      frame.current = 0
      onResize(current.start)
    } else flush()
    onResizing(false)
    if (current.target.hasPointerCapture(current.pointer))
      current.target.releasePointerCapture(current.pointer)
  }
  const start = (event: PointerEvent<HTMLButtonElement>, axis: Axis) => {
    if (disabled || gesture.current || event.button !== 0) return
    const grid = event.currentTarget.closest<HTMLElement>('.artist-layout-grid')
    const tile = event.currentTarget.closest<HTMLElement>('.artist-layout-tile')
    if (!grid || !tile) return
    event.preventDefault()
    event.stopPropagation()
    const style = getComputedStyle(grid)
    const gap = Number.parseFloat(style.columnGap) || 0
    const rowHeight = Number.parseFloat(
      style.getPropertyValue('--layout-row-height'),
    )
    const body = tile.querySelector<HTMLElement>('.artist-layout-content')
    gesture.current = {
      pointer: event.pointerId,
      axis,
      x: event.clientX,
      y: event.clientY,
      start: { columns, rows },
      last: { columns, rows },
      height:
        rows ??
        clampColumns(
          rowsForHeight(body?.offsetHeight ?? rowHeight, rowHeight, gap),
        ),
      columnUnit: (grid.clientWidth + gap) / 12,
      rowUnit: rowHeight + gap,
      target: event.currentTarget,
    }
    event.currentTarget.focus()
    event.currentTarget.setPointerCapture(event.pointerId)
    onResizing(true)
  }
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current
    if (!current || current.pointer !== event.pointerId) return
    const next: Size = {
      ...(current.axis !== 'height'
        ? {
            columns: columnsAfterDrag(
              current.start.columns ?? columns,
              event.clientX - current.x,
              current.columnUnit,
            ),
          }
        : {}),
      ...(current.axis !== 'width'
        ? {
            rows: columnsAfterDrag(
              current.height,
              event.clientY - current.y,
              current.rowUnit,
            ),
          }
        : {}),
    }
    if (
      next.columns === current.last.columns &&
      next.rows === current.last.rows
    )
      return
    current.last = next
    pending.current = next
    if (!frame.current) frame.current = requestAnimationFrame(flush)
  }
  const key = (event: KeyboardEvent<HTMLButtonElement>, axis: Axis) => {
    if (event.key === 'Escape' && gesture.current) {
      event.preventDefault()
      event.stopPropagation()
      finish(true)
      return
    }
    if (disabled) return
    const horizontal =
      axis !== 'height' && ['ArrowLeft', 'ArrowRight'].includes(event.key)
    const vertical =
      axis !== 'width' && ['ArrowUp', 'ArrowDown'].includes(event.key)
    if (!horizontal && !vertical && event.key !== 'Home' && event.key !== 'End')
      return
    event.preventDefault()
    event.stopPropagation()
    if (horizontal || (axis === 'width' && ['Home', 'End'].includes(event.key)))
      onResize({
        columns: clampColumns(
          event.key === 'Home'
            ? 1
            : event.key === 'End'
              ? 12
              : columns + (event.key === 'ArrowLeft' ? -1 : 1),
        ),
      })
    else
      onResize({
        rows: clampColumns(
          event.key === 'Home'
            ? 1
            : event.key === 'End'
              ? 12
              : (rows ?? naturalRows(event.currentTarget)) +
                (event.key === 'ArrowUp' ? -1 : 1),
        ),
      })
  }
  const handles = [
    { axis: 'width', icon: ArrowLeftRight, key: 'layout.resize' },
    { axis: 'height', icon: ArrowDownUp, key: 'layout.resizeHeight' },
    { axis: 'both', icon: MoveDiagonal2, key: 'layout.resizeBoth' },
  ] as const
  return (
    <>
      <select
        aria-label={t('layout.columns', { tile: label })}
        className="artist-layout-width"
        disabled={disabled}
        onChange={(event) => onResize({ columns: Number(event.target.value) })}
        value={columns}
      >
        {spans.map((span) => (
          <option key={span} value={span}>
            ↔ {span}/12
          </option>
        ))}
      </select>
      <select
        aria-label={t('layout.rows', { tile: label })}
        className="artist-layout-width"
        disabled={disabled}
        onChange={(event) =>
          onResize({
            rows:
              event.target.value === 'auto'
                ? undefined
                : Number(event.target.value),
          })
        }
        value={rows ?? 'auto'}
      >
        <option value="auto">↕ {t('layout.auto')}</option>
        {spans.map((span) => (
          <option key={span} value={span}>
            ↕ {span}/12
          </option>
        ))}
      </select>
      {handles.map(({ axis, icon: Icon, key: labelKey }) => (
        <button
          aria-label={t(labelKey, { tile: label })}
          {...(axis === 'both'
            ? {}
            : {
                'aria-orientation':
                  axis === 'height'
                    ? ('vertical' as const)
                    : ('horizontal' as const),
              })}
          className="artist-layout-resize"
          data-axis={axis}
          disabled={disabled}
          key={axis}
          onKeyDown={(event) => key(event, axis)}
          onLostPointerCapture={() => finish(true)}
          onPointerCancel={() => finish(true)}
          onPointerDown={(event) => start(event, axis)}
          onPointerMove={move}
          onPointerUp={() => finish(false)}
          role={axis === 'both' ? undefined : 'slider'}
          type="button"
        >
          <Icon aria-hidden="true" className="size-4" />
        </button>
      ))}
    </>
  )
}
