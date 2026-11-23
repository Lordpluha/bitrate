import { Button } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { Plus } from 'lucide-react'
import { useId } from 'react'
import { firstFreeSpot } from '../model/grid'
import type { TileDefinition } from '../model/layout'
import type { CustomizableLayout } from '../model/useCustomizableLayout'

/**
 * Tiles removed from the grid wait here while customizing. Adding one puts it back at its
 * default size in the first free spot from the top left.
 */
export function TileDrawer({ layout }: { layout: CustomizableLayout }) {
  const { t } = useI18n()
  const headingId = useId()
  const placed = new Set(layout.tiles.map((tile) => tile.id))
  const waiting = layout.definitions.filter(
    (definition) => !placed.has(definition.id),
  )
  const add = ({ id, size }: TileDefinition) =>
    layout.change([
      ...layout.tiles,
      { id, ...firstFreeSpot(layout.tiles, size), ...size },
    ])
  return (
    <aside aria-labelledby={headingId} className="artist-free-drawer">
      <h2 className="artist-free-drawer-title" id={headingId}>
        {t('layout.drawer.title')}
      </h2>
      {waiting.length === 0 ? (
        <p className="artist-free-drawer-empty">{t('layout.drawer.empty')}</p>
      ) : (
        <ul>
          {waiting.map((definition) => (
            <li key={definition.id}>
              <span>{t(definition.label)}</span>
              <Button
                aria-label={t('layout.add', { tile: t(definition.label) })}
                className="size-8 p-0"
                disabled={layout.saving}
                onClick={() => add(definition)}
                size="icon"
                variant="outline"
              >
                <Plus aria-hidden="true" className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
