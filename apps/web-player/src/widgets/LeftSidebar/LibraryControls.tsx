import { RecentsIcon, SearchIcon } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { useI18n } from '@/shared/i18n'

export const LibraryControls = () => {
  const { t } = useI18n()
  return (
    <div className="mt-4 flex gap-2 justify-between items-center">
      <Link
        aria-label={t('nav.search')}
        className="duration-200 hover:opacity-70"
        href={ROUTES.search()}
      >
        <SearchIcon />
      </Link>
      <button
        className="duration-200 flex items-center gap-2 hover:opacity-70"
        type="button"
      >
        <span>{t('library.recents')}</span>
        <RecentsIcon />
      </button>
    </div>
  )
}
