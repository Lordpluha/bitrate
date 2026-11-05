import { Button } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { Check, LayoutGrid, RotateCcw } from 'lucide-react'
import type { CustomizableLayout } from '../model/useCustomizableLayout'

/**
 * Customize sits in the page heading, where it is seen but out of the way. In customize mode
 * the same spot holds Reset, Cancel and Done.
 */
export function CustomizeControls({ layout }: { layout: CustomizableLayout }) {
  const { t, tMessage } = useI18n()
  if (!layout.editing)
    return (
      <Button
        className="artist-layout-customize"
        onClick={layout.edit}
        size="sm"
        title={t('layout.customizeHint')}
        variant="outline"
      >
        <LayoutGrid aria-hidden="true" className="size-4" />
        <span className="artist-layout-customize-label">
          {t('layout.customize')}
        </span>
      </Button>
    )
  return (
    <div className="artist-layout-controls">
      {layout.saveError && (
        <p className="artist-layout-error" role="alert">
          {tMessage(layout.saveError)}
        </p>
      )}
      <Button onClick={layout.reset} size="sm" variant="ghost">
        <RotateCcw aria-hidden="true" className="size-4" />
        {t('layout.reset')}
      </Button>
      <Button onClick={layout.cancel} size="sm" variant="outline">
        {t('common.cancel')}
      </Button>
      <Button
        disabled={layout.saving}
        onClick={layout.done}
        size="sm"
        variant="primary"
      >
        <Check aria-hidden="true" className="size-4" />
        {layout.saving ? t('layout.saving') : t('layout.done')}
      </Button>
    </div>
  )
}
