import { cn } from '@bitrate/ui-react'
import { useI18n } from '@/shared/i18n'
import type { LibraryControls } from '@/views/Library/model/library.types'
import { libraryTabs } from '@/views/Library/model/library.utils'

type LibraryTabsProps = {
  controls: LibraryControls
  onChange: (controls: Partial<LibraryControls>) => void
}

export const LibraryTabs = ({ controls, onChange }: LibraryTabsProps) => {
  const { t } = useI18n()

  return (
    <div
      aria-label={t('library.title')}
      className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      role="tablist"
    >
      {libraryTabs.map((tab) => (
        <button
          aria-selected={controls.activeSection === tab.id}
          className={cn(
            'h-9 shrink-0 rounded-md px-3 text-sm font-medium transition-colors',
            controls.activeSection === tab.id
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:bg-surface hover:text-foreground',
          )}
          key={tab.id}
          onClick={() => onChange({ activeSection: tab.id })}
          role="tab"
          type="button"
        >
          {tab.id === 'playlists'
            ? t('library.playlists')
            : tab.id === 'liked'
              ? t('library.liked')
              : tab.id === 'albums'
                ? t('library.albums')
                : t('library.history')}
        </button>
      ))}
    </div>
  )
}
