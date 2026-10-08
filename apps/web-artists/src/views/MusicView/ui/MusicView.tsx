import { type CatalogueSearch, useMusicCounts } from '@entities/music'
import { useAuthContext } from '@shared/hooks/AuthContext'
import { MusicCatalogue } from '@widgets/MusicCatalogue'

export function MusicView({ search }: { search: CatalogueSearch }) {
  const { artist } = useAuthContext()
  const counts = useMusicCounts(artist?.id)
  return (
    <section className="artist-music space-y-8 lg:space-y-6">
      <div>
        <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">Music</h1>
        <p className="mt-2 hidden text-[0.9375rem] text-text-secondary lg:block">
          Manage tracks, releases and drafts.
        </p>
        <p className="mt-2 text-[0.8125rem] text-text-secondary lg:hidden">
          {counts.data
            ? `${counts.data.tracks} tracks · ${counts.data.releases} releases`
            : 'Your music catalogue'}
        </p>
      </div>
      <MusicCatalogue search={search} />
    </section>
  )
}
