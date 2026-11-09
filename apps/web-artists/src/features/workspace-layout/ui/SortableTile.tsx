import { cn } from '@bitrate/ui-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useI18n } from '@shared/i18n'
import { Eye, EyeOff, GripVertical } from 'lucide-react'
import { type CSSProperties, type ReactNode, useState } from 'react'
import type { LayoutTile, TileDefinition } from '../model/layout'
import { TileWidthControl } from './TileWidthControl'

interface SortableTileProps {
  tile: LayoutTile
  definition: TileDefinition
  columns: number
  saving: boolean
  onResize: (size: Pick<LayoutTile, 'columns' | 'rows'>) => void
  onToggleHidden: () => void
  children: ReactNode
}

/** One tile in customize mode: its content is inert and a toolbar moves, sizes or hides it. */
export function SortableTile({
  tile,
  definition,
  columns,
  saving,
  onResize,
  onToggleHidden,
  children,
}: SortableTileProps) {
  const { t } = useI18n()
  const [resizing, setResizing] = useState(false)
  const label = t(definition.label)
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tile.id, disabled: saving || resizing })
  return (
    <div
      className={cn(
        'artist-layout-tile',
        isDragging && 'artist-layout-dragging',
      )}
      data-columns={columns}
      data-editing="true"
      data-hidden={tile.hidden}
      data-resizing={resizing}
      data-rows={tile.rows ?? 'auto'}
      data-size={tile.size}
      ref={setNodeRef}
      style={
        {
          '--layout-columns': columns,
          transform: CSS.Translate.toString(transform),
          transition,
        } as CSSProperties
      }
    >
      <div className="artist-layout-toolbar">
        <button
          aria-label={t('layout.move', { tile: label })}
          className="artist-layout-handle"
          disabled={saving}
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="size-4" />
          <span>{label}</span>
        </button>
        <TileWidthControl
          columns={columns}
          disabled={saving}
          label={label}
          onResize={onResize}
          onResizing={setResizing}
          rows={tile.rows}
        />
        <button
          aria-label={t(tile.hidden ? 'layout.show' : 'layout.hide', {
            tile: label,
          })}
          aria-pressed={tile.hidden}
          className="artist-layout-visibility"
          disabled={saving}
          onClick={onToggleHidden}
          type="button"
        >
          {tile.hidden ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
      <div className="artist-layout-content" inert>
        {children}
      </div>
    </div>
  )
}
