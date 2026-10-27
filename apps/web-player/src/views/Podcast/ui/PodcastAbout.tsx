import type { PodcastDetail } from '@/entities/Podcast'
import { useI18n } from '@/shared/i18n'

type PodcastAboutProps = {
  podcast: PodcastDetail
}

/** The About tab: the full description, publisher, language and content rating. */
export const PodcastAbout = ({ podcast }: PodcastAboutProps) => {
  const { t } = useI18n()

  return (
    <section className="flex w-full max-w-160 flex-col gap-4 rounded-[14px] border border-border bg-card p-6">
      <h2 className="text-base font-semibold">{t('podcast.about')}</h2>
      {podcast.description ? (
        <p className="text-sm text-muted-foreground">{podcast.description}</p>
      ) : null}
      <dl className="flex flex-col divide-y divide-border text-sm">
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-muted-foreground">{t('podcast.publisher')}</dt>
          <dd className="font-semibold">{podcast.publisher}</dd>
        </div>
        {podcast.language ? (
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-muted-foreground">{t('podcast.language')}</dt>
            <dd className="font-semibold uppercase">{podcast.language}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-muted-foreground">{t('podcast.content')}</dt>
          <dd className="font-semibold">
            {podcast.explicit ? t('podcast.explicit') : t('podcast.clean')}
          </dd>
        </div>
      </dl>
    </section>
  )
}
