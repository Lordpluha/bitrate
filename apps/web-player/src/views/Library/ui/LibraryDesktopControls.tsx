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
    <div className="hidden items-center justify-between gap-3 xl:flex">
      <label className="relative w-80">
        <span className="sr-only">{t('library.filter')}</span>
        <SearchIcon
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={16}
        />
        <input
          className="h-9 w-full rounded-md border border-border bg-background pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder={t('library.filter')}
          value={controls.query}
        />
      </label>
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
          <option value="recent">{t('library.recents')}</option>
          <option value="title">{t('common.title')}</option>
        </select>
      </label>
    </div>
  )
}
