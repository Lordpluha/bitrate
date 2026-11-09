'use client'

import { useAlbum } from '@entities/Album'
import type { TrackEntity } from '@entities/Track'
import { getApiErrorStatus } from '@shared/api/errors'
import { useI18n } from '@shared/i18n'
import { ErrorState } from '@shared/ui'
import {
  CollectionPanel,
  CollectionSkeleton,
} from '@shared/ui/CollectionHeader'
import { getAlbumCoverUrl } from '@shared/utils/mediaUrl'
import { AlbumHero } from './AlbumHero'
import { AlbumNotFound } from './AlbumNotFound'
import { AlbumTrackSection } from './AlbumTrackSection'

const getAlbumDuration = (tracks: TrackEntity[]) =>
  tracks.reduce((duration, track) => duration + (track.duration ?? 0), 0)

export const AlbumPage = ({ albumId }: { albumId: string }) => {
  const { t } = useI18n()
  const { data, error, isError, isPending, refetch } = useAlbum(albumId)
  const album = data
  const tracks = album?.tracks ?? []
  const coverUrl = getAlbumCoverUrl(album?.cover)

  if (isPending) {
    return (
      <CollectionPanel>
        <CollectionSkeleton label={t('album.loading')} />
      </CollectionPanel>
    )
  }

  /* a missing album is not found; any other failure can be retried */
  if (isError && getApiErrorStatus(error) !== 404) {
    return (
      <CollectionPanel>
        <ErrorState
          description={t('error.tryAgainShort')}
          onRetry={() => void refetch()}
          title={t('album.loadFailed')}
        />
      </CollectionPanel>
    )
  }

  if (isError || !album) return <AlbumNotFound />

  return (
    <CollectionPanel>
      <AlbumHero
        album={album}
        coverUrl={coverUrl}
        duration={getAlbumDuration(tracks)}
        trackCount={tracks.length}
      />
      <AlbumTrackSection
        albumId={album.id}
        albumTitle={album.title}
        tracks={tracks}
      />
    </CollectionPanel>
  )
}
