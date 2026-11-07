import { cn } from '@bitrate/ui-react'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useI18n } from '@shared/i18n'
import type { CSSProperties, ReactNode } from 'react'
import { type LayoutTile, tileColumns } from '../model/layout'
import type { CustomizableLayout } from '../model/useCustomizableLayout'
import { useGridGeometry } from '../model/useGridGeometry'
import { SortableTile } from './SortableTile'

interface LayoutGridProps {
  layout: CustomizableLayout
  /** Interprets legacy S/M/L preferences; numeric widths always use twelve columns. */
  variant: 'thirds' | 'halves'
  renderTile: (id: string) => ReactNode
  /** Shown beside the editing hint, for pages whose heading has no room for the controls. */
  editingActions?: ReactNode
  className?: string
}

/** A page's tiles in the artist's arrangement; sortable while customizing. */
export function LayoutGrid({
  layout,
  variant,
  renderTile,
  editingActions,
  className,
}: LayoutGridProps) {
  const { t } = useI18n()
  const dimensional = layout.tiles.some((tile) => tile.rows !== undefined)
  const { gridRef, capture } = useGridGeometry(
    layout.tiles,
    layout.editing,
    layout.editing || dimensional,
  )
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const label = (id: string | number) => {
    const definition = layout.definitions.find((item) => item.id === id)
    return definition ? t(definition.label) : String(id)
  }
  const position = (id: string | number) =>
    layout.tiles.findIndex((tile) => tile.id === id) + 1
  const update = (id: string, patch: Partial<LayoutTile>) => {
    capture()
    layout.change(
      layout.tiles.map((tile) =>
        tile.id === id ? { ...tile, ...patch } : tile,
      ),
    )
  }
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = layout.tiles.findIndex((tile) => tile.id === active.id)
    const to = layout.tiles.findIndex((tile) => tile.id === over.id)
    layout.change(arrayMove(layout.tiles, from, to))
  }

  const grid = (
    <div
      className={cn('artist-layout-grid', className)}
      data-dimensional={dimensional}
      data-editing={layout.editing}
      data-variant={variant}
      ref={gridRef}
    >
      {layout.tiles.map((tile) => {
        const definition = layout.definitions.find(
          (item) => item.id === tile.id,
        )
        if (!definition) return null
        if (!layout.editing)
          return tile.hidden ? null : (
            <div
              className="artist-layout-tile"
              data-columns={tileColumns(tile, variant)}
              data-rows={tile.rows ?? 'auto'}
              data-size={tile.size}
              key={tile.id}
              style={
                {
                  '--layout-columns': tileColumns(tile, variant),
                } as CSSProperties
              }
            >
              <div className="artist-layout-content">{renderTile(tile.id)}</div>
            </div>
          )
        return (
          <SortableTile
            columns={tileColumns(tile, variant)}
            definition={definition}
            key={tile.id}
            onResize={(size) => update(tile.id, size)}
            onToggleHidden={() => update(tile.id, { hidden: !tile.hidden })}
            saving={layout.saving}
            tile={tile}
          >
            {renderTile(tile.id)}
          </SortableTile>
        )
      })}
    </div>
  )

  if (!layout.editing) return <div className="artist-layout">{grid}</div>
  return (
    <div className="artist-layout">
      <div className="artist-layout-editbar">
        <p className="artist-layout-hint">{t('layout.editingHint')}</p>
        {editingActions}
      </div>
      <div aria-hidden="true" className="artist-layout-ruler">
        {Array.from({ length: 12 }, (_, index) => index + 1).map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      <p className="artist-layout-mobile-hint">{t('layout.mobileHint')}</p>
      <DndContext
        accessibility={{
          screenReaderInstructions: { draggable: t('layout.instructions') },
          announcements: {
            onDragStart: ({ active }) =>
              t('layout.announce.picked', { tile: label(active.id) }),
            onDragOver: ({ active, over }) =>
              over
                ? t('layout.announce.over', {
                    tile: label(active.id),
                    position: position(over.id),
                    total: layout.tiles.length,
                  })
                : undefined,
            onDragEnd: ({ active, over }) =>
              t('layout.announce.dropped', {
                tile: label(active.id),
                position: position(over?.id ?? active.id),
              }),
            onDragCancel: ({ active }) =>
              t('layout.announce.cancelled', { tile: label(active.id) }),
          },
        }}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={layout.tiles.map((tile) => tile.id)}
          strategy={rectSortingStrategy}
        >
          {grid}
        </SortableContext>
      </DndContext>
    </div>
  )
}
