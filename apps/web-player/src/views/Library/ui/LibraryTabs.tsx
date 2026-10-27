import { SegmentedTabs } from '@shared/ui'
import { useI18n } from '@/shared/i18n'
import type { LibraryControls } from '@/views/Library/model/library.types'

type LibraryTabsProps = {
  controls: LibraryControls
  onChange: (controls: Partial<LibraryControls>) => void
}

/** The library's sections, as the shared Segmented Tabs. */
export const LibraryTabs = ({ controls, onChange }: LibraryTabsProps) => {
  const { t } = useI18n()

  return (
    <SegmentedTabs
      ariaLabel={t('library.title')}
      className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      onChange={(activeSection) => onChange({ activeSection })}
      tabs={[
        { id: 'playlists', label: t('library.playlists') },
        { id: 'liked', label: t('library.liked') },
        { id: 'albums', label: t('library.albums') },
      ]}
      value={controls.activeSection}
    />
  )
}
