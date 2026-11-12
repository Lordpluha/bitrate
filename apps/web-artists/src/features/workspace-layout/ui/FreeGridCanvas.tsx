import { useI18n } from '@shared/i18n'
import { X } from 'lucide-react'
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react'
import {
  type CellRect,
  type CellSize,
  GRID_COLUMNS,
  type GridTile,
  placeTile,
  RESIZE_HANDLES,
  type ResizeHandle,
  resizeTile,
  resizeTileFrom,
} from '../model/grid'
import type { CustomizableLayout } from '../model/useCustomizableLayout'

/** Row height and gap in pixels; the stylesheet reads both from the canvas. */
const ROW_PX = 56
const GAP_PX = 12
/** Empty rows below the lowest tile while customizing, so the canvas can grow. */
const EDITING_SPARE_ROWS = 2

const ARROWS: Readonly<Record<string, readonly [number, number]>> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

interface Preview {
  tiles: GridTile[]
  /** Where the dragged tile will land; the ghost marks it. */
  target: GridTile
  shrunk: boolean
  /** The moving tile follows the pointer, in pixels from the canvas corner. */
  float?: { left: number; top: number }
}

interface Drag {
  id: string
  pointerId: number
  handle: ResizeHandle | null
  base: GridTile[]
  start: GridTile
  /** Where the pointer grabbed the tile, from its corner. */
  grabX: number
  grabY: number
  startX: number
  startY: number
  preview: Preview | null
}

const cellStyle = ({ x, y, w, h }: CellRect) =>
  ({ '--x': x, '--y': y, '--w': w, '--h': h }) as CSSProperties

const isResizeHandle = (value: string | undefined): value is ResizeHandle =>
  RESIZE_HANDLES.some((handle) => handle === value)

/** The resize handle under the pointer, if any. */
function resizeHandleOf(target: Element | null): ResizeHandle | null {
  const value = target?.closest<HTMLElement>('[data-resize]')?.dataset.resize
  return isResizeHandle(value) ? value : null
}

interface FreeGridCanvasProps {
  layout: CustomizableLayout
  renderTile: (id: string) => ReactNode
}

/** Editable grid with pointer placement, eight resize handles and keyboard controls. */
export function FreeGridCanvas({ layout, renderTile }: FreeGridCanvasProps) {
  const { t } = useI18n()
  const canvasRef = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const [preview, setPreview] = useState<{
    id: string
    value: Preview
  } | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const instructionsId = useId()
  const editable = layout.editing && !layout.saving
  const tiles = preview?.value.tiles ?? layout.tiles
  const bottom = Math.max(0, ...tiles.map((tile) => tile.y + tile.h))
  const rows = Math.max(1, bottom + (layout.editing ? EDITING_SPARE_ROWS : 0))

  const definition = (id: string) =>
    layout.definitions.find((item) => item.id === id)
  const label = (id: string) => {
    const found = definition(id)
    return found ? t(found.label) : id
  }
  const minSize = (id: string): CellSize =>
    definition(id)?.minSize ?? { w: 1, h: 1 }

  const show = (id: string, value: Preview | null) => {
    if (drag.current) drag.current.preview = value
    setPreview(value ? { id, value } : null)
  }

  const onPointerDown = (
    tile: GridTile,
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (!editable || event.button !== 0) return
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest('[data-remove]')) return
    const box = event.currentTarget.getBoundingClientRect()
    drag.current = {
      id: tile.id,
      pointerId: event.pointerId,
      handle: resizeHandleOf(target),
      base: layout.tiles,
      start: tile,
      grabX: event.clientX - box.left,
      grabY: event.clientY - box.top,
      startX: event.clientX,
      startY: event.clientY,
      preview: null,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    event.preventDefault()
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current
    const canvas = canvasRef.current
    if (!current || !canvas || event.pointerId !== current.pointerId) return
    const box = canvas.getBoundingClientRect()
    const stepX = (box.width + GAP_PX) / GRID_COLUMNS
    const stepY = ROW_PX + GAP_PX
    const min = minSize(current.id)
    if (current.handle) {
      const next = resizeTileFrom(
        current.base,
        current.id,
        current.handle,
        {
          x: Math.round((event.clientX - current.startX) / stepX),
          y: Math.round((event.clientY - current.startY) / stepY),
        },
        min,
      )
      const target = next.find((tile) => tile.id === current.id)
      if (target) show(current.id, { tiles: next, target, shrunk: false })
      return
    }
    const left = event.clientX - box.left - current.grabX
    const top = event.clientY - box.top - current.grabY
    const placement = placeTile(
      current.base,
      current.id,
      {
        x: Math.round(left / stepX),
        y: Math.round(top / stepY),
        w: current.start.w,
        h: current.start.h,
      },
      min,
    )
    const target = placement.tiles.find((tile) => tile.id === current.id)
    if (target)
      show(current.id, {
        tiles: placement.tiles,
        target,
        shrunk: placement.shrunk,
        float: { left, top },
      })
  }

  const finish = (commit: boolean) => {
    const current = drag.current
    if (!current) return
    drag.current = null
    if (commit && current.preview) layout.change(current.preview.tiles)
    setPreview(null)
  }

  const onKeyDown = (
    tile: GridTile,
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === 'Escape' && drag.current) {
      finish(false)
      return
    }
    const arrow = ARROWS[event.key]
    if (!editable || !arrow || event.target !== event.currentTarget) return
    event.preventDefault()
    const [dx, dy] = arrow
    const next = event.shiftKey
      ? resizeTile(
          layout.tiles,
          tile.id,
          { w: tile.w + dx, h: tile.h + dy },
          minSize(tile.id),
        )
      : placeTile(
          layout.tiles,
          tile.id,
          { ...tile, x: tile.x + dx, y: tile.y + dy },
          minSize(tile.id),
        ).tiles
    layout.change(next)
    const moved = next.find((item) => item.id === tile.id)
    if (moved)
      setAnnouncement(
        t('layout.announce.position', {
          tile: label(tile.id),
          column: moved.x + 1,
          row: moved.y + 1,
          columns: moved.w,
          rows: moved.h,
        }),
      )
  }

  return (
    <div
      className="artist-free-grid"
      data-editing={layout.editing}
      data-testid="free-grid"
      onPointerCancel={() => finish(false)}
      onPointerMove={onPointerMove}
      onPointerUp={() => finish(true)}
      ref={canvasRef}
      style={
        {
          '--grid-rows': rows,
          '--grid-row': `${ROW_PX}px`,
          '--grid-gap': `${GAP_PX}px`,
        } as CSSProperties
      }
    >
      {tiles.map((tile) => {
        if (!layout.editing)
          return (
            <div
              className="artist-layout-tile artist-free-tile"
              key={tile.id}
              style={cellStyle(tile)}
            >
              <div className="artist-layout-content">{renderTile(tile.id)}</div>
            </div>
          )
        const float = preview?.id === tile.id ? preview.value.float : undefined
        // The full-size handle takes focus for keyboard movement and resizing.
        return (
          <div
            className="artist-layout-tile artist-free-tile"
            data-dragging={preview?.id === tile.id || undefined}
            key={tile.id}
            onPointerDown={(event) => onPointerDown(tile, event)}
            style={{
              ...cellStyle(tile),
              ...(float && { left: float.left, top: float.top }),
            }}
          >
            <div className="artist-layout-content" inert>
              {renderTile(tile.id)}
            </div>
            <button
              aria-describedby={instructionsId}
              aria-label={t('layout.move', { tile: label(tile.id) })}
              className="artist-free-handle"
              disabled={!editable}
              onKeyDown={(event) => onKeyDown(tile, event)}
              type="button"
            />
            <button
              aria-label={t('layout.remove', { tile: label(tile.id) })}
              className="artist-free-remove"
              data-remove
              disabled={!editable}
              onClick={() =>
                layout.change(
                  layout.tiles.filter((item) => item.id !== tile.id),
                )
              }
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
            {RESIZE_HANDLES.map((handle) => (
              <span
                aria-hidden="true"
                className="artist-free-resize"
                data-resize={handle}
                key={handle}
              />
            ))}
          </div>
        )
      })}
      {preview && (
        <div
          aria-hidden="true"
          className="artist-free-ghost"
          style={cellStyle(preview.value.target)}
        >
          {preview.value.shrunk && <span>{t('layout.willShrink')}</span>}
        </div>
      )}
      {layout.editing && (
        <>
          <p className="sr-only" id={instructionsId}>
            {t('layout.instructions')}
          </p>
          <p className="sr-only" role="status">
            {announcement}
          </p>
        </>
      )}
    </div>
  )
}
