import { cn } from '@bitrate/ui-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useI18n } from '@shared/i18n'
import { Eye, EyeOff, GripVertical } from 'lucide-react'
import type { ReactNode } from 'react'
import type { LayoutTile, TileDefinition, TileSize } from '../model/layout'

interface SortableTileProps {
  tile: LayoutTile
  definition: TileDefinition
  onResize: (size: TileSize) => void
  onToggleHidden: () => void
  children: ReactNode
}

/** One tile in customize mode: its content is inert and a toolbar moves, sizes or hides it. */
export function SortableTile({
  tile,
  definition,
  onResize,
  onToggleHidden,
  children,
}: SortableTileProps) {
  const { t } = useI18n()
  const label = t(definition.label)
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tile.id })
  return (
    <div
      className={cn(
        'artist-layout-tile',
        isDragging && 'artist-layout-dragging',
      )}
      data-editing="true"
      data-hidden={tile.hidden}
      data-size={tile.size}
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <div className="artist-layout-toolbar">
        <button
          aria-label={t('layout.move', { tile: label })}
          className="artist-layout-handle"
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="size-4" />
          <span>{label}</span>
        </button>
        {definition.sizes.length > 1 && (
          <fieldset className="artist-layout-sizes">
            <legend className="sr-only">
              {t('layout.size', { tile: label })}
            </legend>
            {definition.sizes.map((size) => (
              <button
                aria-label={t(`layout.size.${size}`)}
                aria-pressed={tile.size === size}
                key={size}
                onClick={() => onResize(size)}
                type="button"
              >
                {size}
              </button>
            ))}
          </fieldset>
        )}
        <button
          aria-label={t(tile.hidden ? 'layout.show' : 'layout.hide', {
            tile: label,
          })}
          aria-pressed={tile.hidden}
          className="artist-layout-visibility"
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
