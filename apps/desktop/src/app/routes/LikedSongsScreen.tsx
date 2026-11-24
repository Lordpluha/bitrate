import { useLikedTracks } from '@entities/Track'
import { useI18n } from '@shared/i18n'
import { CollectionSkeleton } from '@shared/ui/CollectionHeader'
import { ErrorState } from '@shared/ui/ErrorState'
import { LikedSongsPlaylist } from '@views/Playlist/ui/LikedSongsPlaylist'

/** The first page web-player's server adapter loads before rendering Liked Songs. */
const FIRST_PAGE = 1
const PAGE_SIZE = 100

/**
 * Liked Songs. web-player fetches the list on the server and hands it to the view; here the
 * same query runs in the renderer, with the route's loading and error states around it.
 */
export const LikedSongsScreen = () => {
  const { t } = useI18n()
  const { data, isError, refetch } = useLikedTracks(FIRST_PAGE, PAGE_SIZE)

  if (isError) {
    return <ErrorState description={t('error.pageDescription')} onRetry={() => void refetch()} />
  }
  if (!data) return <CollectionSkeleton label="Loading Liked Songs" />

  return <LikedSongsPlaylist tracks={data} />
}
