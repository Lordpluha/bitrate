import { SearchField } from '@shared/ui'
import { useI18n } from '@/shared/i18n'
import type { LibraryControls } from '@/views/Library/model/library.types'

type LibraryDesktopControlsProps = {
  controls: LibraryControls
  onChange: (controls: Partial<LibraryControls>) => void
}

export const LibraryDesktopControls = ({
  controls,
  onChange,
}: LibraryDesktopControlsProps) => {
  const { t } = useI18n()

  return (
    <div className="hidden items-center justify-between gap-3 xl:flex">
      <SearchField
        className="w-80"
        label={t('library.filter')}
        onChange={(query) => onChange({ query })}
        placeholder={t('library.filter')}
        value={controls.query}
      />
      <label>
        <span className="sr-only">{t('library.sort')}</span>
        <select
          className="h-9 w-45 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onChange={(event) =>
            onChange({
              sortMode: event.target.value as LibraryControls['sortMode'],
            })
          }
          value={controls.sortMode}
        >
          <option value="recent">{t('library.sortRecentlyAdded')}</option>
          <option value="title">{t('library.sortTitle')}</option>
        </select>
      </label>
    </div>
  )
}
