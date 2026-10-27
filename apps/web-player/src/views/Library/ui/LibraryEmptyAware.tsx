import { StateMessage } from '@shared/ui'
import { LibraryBig } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'

/** The design's empty library: nothing saved yet, with a way to create the first playlist. */
export const LibraryEmptyState = () => {
  const { t } = useI18n()

  return (
    <StateMessage
      className="min-h-80"
      description={t('library.emptyDescription')}
      icon={LibraryBig}
      primary={{
        href: ROUTES.createPlaylist,
        label: t('library.createPlaylist'),
      }}
      title={t('library.empty')}
    />
  )
}
