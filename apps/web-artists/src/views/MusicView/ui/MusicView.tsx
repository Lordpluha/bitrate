import { type CatalogueSearch, useMusicCounts } from '@entities/music'
import { useAuthContext } from '@shared/hooks/AuthContext'
import { useI18n } from '@shared/i18n'
import { MusicCatalogue } from '@widgets/MusicCatalogue'

export function MusicView({ search }: { search: CatalogueSearch }) {
  const { artist } = useAuthContext()
  const counts = useMusicCounts(artist?.id)
  const { t, tp } = useI18n()
  return (
    <section className="artist-music space-y-8 lg:space-y-6">
      <div>
        <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">
          {t('music.title')}
        </h1>
        <p className="mt-2 hidden text-[0.9375rem] text-text-secondary lg:block">
          {t('music.subtitle')}
        </p>
        <p className="mt-2 text-[0.8125rem] text-text-secondary lg:hidden">
          {counts.data
            ? `${tp({ count: counts.data.tracks, key: 'common.tracks' })} · ${tp({ count: counts.data.releases, key: 'music.releases' })}`
            : t('music.catalogue')}
        </p>
      </div>
      <MusicCatalogue search={search} />
    </section>
  )
}
