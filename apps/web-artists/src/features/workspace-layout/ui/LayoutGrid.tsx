import { Button, cn } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { ArrowUpToLine } from 'lucide-react'
import type { ReactNode } from 'react'
import { compactLayout, readingOrder } from '../model/grid'
import { useCompactViewport } from '../model/useCompactViewport'
import type { CustomizableLayout } from '../model/useCustomizableLayout'
import { FreeGridCanvas } from './FreeGridCanvas'
import { TileDrawer } from './TileDrawer'

interface LayoutGridProps {
  layout: CustomizableLayout
  renderTile: (id: string) => ReactNode
  /** Shown beside the editing hint, for pages whose heading has no room for the controls. */
  editingActions?: ReactNode
  className?: string
}

/**
 * A page's tiles in the artist's arrangement on a free 12-column grid, editable while
 * customizing. Phones and touch-only screens stack the tiles in reading order, read-only.
 */
export function LayoutGrid({
  layout,
  renderTile,
  editingActions,
  className,
}: LayoutGridProps) {
  const { t } = useI18n()
  const compact = useCompactViewport()

  if (compact)
    return (
      <div className={cn('artist-layout', className)}>
        {layout.editing && (
          <p className="artist-layout-mobile-hint">{t('layout.mobileHint')}</p>
        )}
        <div className="artist-free-stack">
          {readingOrder(layout.tiles).map((tile) => (
            <div className="artist-layout-tile" key={tile.id}>
              <div className="artist-layout-content">{renderTile(tile.id)}</div>
            </div>
          ))}
        </div>
      </div>
    )

  const canvas = <FreeGridCanvas layout={layout} renderTile={renderTile} />
  if (!layout.editing)
    return <div className={cn('artist-layout', className)}>{canvas}</div>
  return (
    <div className={cn('artist-layout', className)}>
      <div className="artist-layout-editbar">
        <p className="artist-layout-hint">{t('layout.editingHint')}</p>
        <Button
          disabled={layout.saving}
          onClick={() => layout.change(compactLayout(layout.tiles))}
          size="sm"
          variant="outline"
        >
          <ArrowUpToLine aria-hidden="true" className="size-4" />
          {t('layout.pullUp')}
        </Button>
        {editingActions}
      </div>
      <TileDrawer layout={layout} />
      {canvas}
    </div>
  )
}
