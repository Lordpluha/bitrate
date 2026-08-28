import { SearchIcon } from 'lucide-react'
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
    <div className="hidden flex-wrap gap-3 xl:flex">
      <label className="relative min-w-64 max-w-100 flex-1">
        <span className="sr-only">{t('library.filter')}</span>
        <SearchIcon
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subdued"
          size={18}
        />
        <input
          className="h-10 w-full rounded-md bg-surface pl-10 pr-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder={t('library.filter')}
          value={controls.query}
        />
      </label>
      <label>
        <span className="sr-only">{t('library.sort')}</span>
        <select
          className="h-10 rounded-md bg-surface px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
          onChange={(event) =>
            onChange({
              sortMode: event.target.value as LibraryControls['sortMode'],
            })
          }
          value={controls.sortMode}
        >
          <option value="recent">{t('library.recents')}</option>
          <option value="title">{t('common.title')}</option>
        </select>
      </label>
    </div>
  )
}
