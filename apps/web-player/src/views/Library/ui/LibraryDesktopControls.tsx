import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bitrate/ui-react'
import { SearchField } from '@shared/ui'
import { useI18n } from '@/shared/i18n'
import type {
  LibraryControls,
  SortMode,
} from '@/views/Library/model/library.types'

type LibraryDesktopControlsProps = {
  controls: LibraryControls
  onChange: (controls: Partial<LibraryControls>) => void
}

const isSortMode = (value: unknown): value is SortMode =>
  value === 'recent' || value === 'title'

/** The filter field and the design's 180px kit Select for the sort order. */
export const LibraryDesktopControls = ({
  controls,
  onChange,
}: LibraryDesktopControlsProps) => {
  const { t } = useI18n()
  const sortItems = [
    { label: t('library.sortRecentlyAdded'), value: 'recent' },
    { label: t('library.sortTitle'), value: 'title' },
  ]

  return (
    <div className="hidden items-center justify-between gap-3 xl:flex">
      <SearchField
        className="w-80"
        label={t('library.filter')}
        onChange={(query) => onChange({ query })}
        placeholder={t('library.filter')}
        value={controls.query}
      />
      <Select
        items={sortItems}
        onValueChange={(sortMode) => {
          if (isSortMode(sortMode)) onChange({ sortMode })
        }}
        value={controls.sortMode}
      >
        <SelectTrigger aria-label={t('library.sort')} className="w-45">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortItems.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
