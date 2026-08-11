import { cn } from '@spotify/ui-react'
import { ArrowDownUp, Grid3X3, List, SearchIcon, X } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n'
import type { LibraryControls } from '@/views/Library/model/library.types'

type LibraryMobileControlsProps = {
  controls: LibraryControls
  onChange: (controls: Partial<LibraryControls>) => void
}

export const LibraryMobileControls = ({
  controls,
  onChange,
}: LibraryMobileControlsProps) => {
  const { t } = useI18n()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const isSearchVisible = isSearchOpen || controls.query.length > 0

  return (
    <div className="relative border-t border-border pt-4 xl:hidden">
      <div className="flex h-10 items-center justify-between">
        <button
          className="flex min-h-10 items-center gap-2 rounded-full px-1 text-base font-semibold text-text"
          onClick={() =>
            onChange({
              sortMode: controls.sortMode === 'recent' ? 'title' : 'recent',
            })
          }
          type="button"
        >
          <ArrowDownUp aria-hidden="true" size={19} />
          {controls.sortMode === 'recent'
            ? t('library.recents')
            : t('common.title')}
        </button>
        <button
          aria-label={
            controls.viewMode === 'list'
              ? t('library.switchGrid')
              : t('library.switchList')
          }
          className="flex size-10 items-center justify-center rounded-full text-text hover:bg-surface"
          onClick={() =>
            onChange({
              viewMode: controls.viewMode === 'list' ? 'grid' : 'list',
            })
          }
          type="button"
        >
          {controls.viewMode === 'list' ? (
            <Grid3X3 aria-hidden="true" size={21} />
          ) : (
            <List aria-hidden="true" size={22} />
          )}
        </button>
      </div>
      <div
        className={cn(
          'absolute inset-x-0 top-3 z-10 flex h-12 items-center rounded-md bg-surface px-3 transition-[opacity,transform] duration-200',
          isSearchVisible
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1 opacity-0',
        )}
      >
        <SearchIcon
          aria-hidden="true"
          className="shrink-0 text-text-subdued"
          size={19}
        />
        <input
          aria-label={t('library.search')}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-text outline-none"
          onBlur={() => setIsSearchOpen(false)}
          onChange={(event) => onChange({ query: event.target.value })}
          onFocus={() => setIsSearchOpen(true)}
          placeholder={t('library.search')}
          value={controls.query}
        />
        <button
          aria-label={t('library.clearSearch')}
          className="rounded-full p-1 text-text-subdued hover:text-text"
          onClick={() => {
            onChange({ query: '' })
            setIsSearchOpen(false)
          }}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>
    </div>
  )
}
