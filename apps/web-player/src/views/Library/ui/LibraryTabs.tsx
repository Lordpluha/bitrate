import { SegmentedTabs, segmentedTabClassName } from '@shared/ui'
import Link from 'next/link'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import type { LibraryControls } from '@/views/Library/model/library.types'

type LibraryTabsProps = {
  controls: LibraryControls
  onChange: (controls: Partial<LibraryControls>) => void
}

/**
 * The library's sections as the design's tabs (chips on phones): Playlists, Liked tracks,
 * Albums, and History, which opens the Recents page where listening history lives.
 */
export const LibraryTabs = ({ controls, onChange }: LibraryTabsProps) => {
  const { t } = useI18n()

  return (
    <div className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] max-md:gap-2 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      <SegmentedTabs
        ariaLabel={t('library.title')}
        chipsOnMobile
        className="shrink-0"
        onChange={(activeSection) => onChange({ activeSection })}
        tabs={[
          { id: 'playlists', label: t('library.playlists') },
          { id: 'liked', label: t('library.liked') },
          { id: 'albums', label: t('library.albums') },
        ]}
        value={controls.activeSection}
      />
      <Link
        className={segmentedTabClassName({
          chipsOnMobile: true,
          isActive: false,
        })}
        href={ROUTES.recents}
      >
        {t('library.history')}
      </Link>
    </div>
  )
}
