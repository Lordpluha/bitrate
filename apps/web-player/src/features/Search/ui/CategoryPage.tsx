import { useAlbums } from '@/entities/Album'
import { usePlaylists } from '@/entities/Playlist'
import { useTracks } from '@/entities/Track'
import {
  browseCategories,
  browseImages,
  mockCategoryRows,
} from '@/features/Search/model/search.constants'
import {
  buildMockArtistMixes,
  buildMockCharts,
  buildMockDailyMixes,
  buildMockMixes,
  getMockDescription,
} from '@/features/Search/model/search.mocks'
import type {
  BrowseCategory,
  MediaCardItem,
} from '@/features/Search/model/types'
import { MediaRow } from '@/features/Search/ui/MediaRow'
import { ROUTES } from '@/shared/routes'
import {
  getAlbumCoverUrl,
  getPlaylistCoverUrl,
  getTrackCoverUrl,
} from '@/shared/utils/mediaUrl'

type CategoryPageProps = {
  category: BrowseCategory
}

export const CategoryPage = ({ category }: CategoryPageProps) => {
  const { data: albums = [] } = useAlbums({ limit: 12 })
  const { data: playlistsData } = usePlaylists(1, 12)
  const { data: tracksData } = useTracks({ limit: 12 })
  const categoryMatches = mockCategoryRows[category.title] ?? []
  const playlists = Array.isArray(playlistsData) ? playlistsData : []
  const tracks = tracksData ?? []

  const playlistItems: MediaCardItem[] = playlists
    .slice(0, 8)
    .map((playlist) => ({
      description: playlist.description || 'Playlist',
      href: ROUTES.playlist(playlist.id),
      image: getPlaylistCoverUrl(playlist.cover),
      title: playlist.title,
    }))
  const albumItems: MediaCardItem[] = albums.slice(0, 8).map((album) => ({
    description: 'Album',
    href: ROUTES.album(album.id),
    image: getAlbumCoverUrl(album.cover),
    title: album.title,
  }))
  const trackItems: MediaCardItem[] = tracks.slice(0, 8).map((track) => ({
    description: track.artistId || 'Track',
    image: getTrackCoverUrl(track.cover),
    title: track.title,
  }))
  const mockItems: MediaCardItem[] = categoryMatches.map((title, index) => ({
    description: getMockDescription(category.title, title),
    image: browseImages[index % browseImages.length] ?? browseImages[0],
    title,
  }))
  const categoryGrid =
    mockItems.length > 0
      ? mockItems
      : browseCategories
          .filter((item) => item.title !== category.title)
          .slice(0, 12)
          .map((item) => ({
            description: 'Browse category',
            href: ROUTES.searchCategory(item.title),
            image: item.image,
            title: item.title,
          }))

  return (
    <div
      className="min-h-full bg-background-secondary"
      style={{
        background: `linear-gradient(180deg, ${category.color} 0px, ${category.color} 160px, ${category.color}cc 260px, rgba(18,18,18,0.96) 390px, #121212 520px)`,
      }}
    >
      <section className="flex min-h-[300px] items-end px-6 pb-10 pt-24">
        <div className="mx-auto w-full max-w-[1160px]">
          <h1 className="text-6xl font-black tracking-normal text-white md:text-7xl">
            {category.title}
          </h1>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1160px] space-y-10 px-6 py-8">
        <MediaRow
          items={categoryGrid}
          title={category.title === 'Podcasts' ? 'Categories' : 'Browse all'}
        />
        <MediaRow items={albumItems} title="Discover new music" />
        <MediaRow items={playlistItems} title="Playlists from our editors" />
        <MediaRow items={trackItems} title="Hand-picked new releases" />
        <MediaRow
          items={buildMockMixes(category.title)}
          title="Uniquely yours"
        />
        <MediaRow items={buildMockCharts()} title="Featured Charts" />
        <MediaRow
          items={buildMockDailyMixes(category.title)}
          title="Your Daily Mixes"
        />
        <MediaRow
          items={playlistItems}
          title={`Popular ${category.title} playlists`}
        />
        <MediaRow items={buildMockArtistMixes()} title="Your Artist Mixes" />
      </div>
    </div>
  )
}
