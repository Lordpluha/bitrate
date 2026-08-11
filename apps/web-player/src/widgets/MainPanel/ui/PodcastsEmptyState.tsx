import { Podcast } from 'lucide-react'
import { useI18n } from '@/shared/i18n'

/** Placeholder for the Podcasts tab until the catalogue provides shows. */
export const PodcastsEmptyState = () => {
  const { t } = useI18n()

  return (
    <div className="mt-10 flex flex-col items-center gap-3 rounded-lg bg-surface px-6 py-14 text-center">
      <Podcast className="text-text-subdued" size={40} />
      <h2 className="text-xl font-bold text-text sm:text-2xl">
        {t('main.podcasts.title')}
      </h2>
      <p className="max-w-100 text-sm text-text-subdued">
        {t('main.podcasts.empty')}
      </p>
    </div>
  )
}
