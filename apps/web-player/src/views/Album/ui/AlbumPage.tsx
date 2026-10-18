'use client'

import { useAlbum } from '@entities/Album'
import { type TrackEntity, useLikedTracks } from '@entities/Track'
import { ROUTES } from '@shared/routes'
import { StateMessage } from '@shared/ui'
import {
  CollectionPanel,
  CollectionSkeleton,
} from '@shared/ui/CollectionHeader'
import { getAlbumCoverUrl } from '@shared/utils/mediaUrl'
import { Disc3 } from 'lucide-react'
import { useMemo } from 'react'
import { AlbumHero } from './AlbumHero'
import { AlbumTrackSection } from './AlbumTrackSection'

const getAlbumDuration = (tracks: TrackEntity[]) =>
  tracks.reduce((duration, track) => duration + (track.duration ?? 0), 0)

export const AlbumPage = ({ albumId }: { albumId: string }) => {
  const { data, isError, isPending } = useAlbum(albumId)
  const { data: likedTracks } = useLikedTracks(1, 1000, undefined, {
    staleTime: 5 * 60_000,
  })
  const album = data
  const tracks = album?.tracks ?? []
  const likedTrackIds = useMemo(
    () => new Set((likedTracks ?? []).map((track) => track.id)),
    [likedTracks],
  )
  const coverUrl = getAlbumCoverUrl(album?.cover)

  if (isPending) {
    return (
      <CollectionPanel>
        <CollectionSkeleton label="Loading album" />
      </CollectionPanel>
    )
  }

  if (isError || !album) {
    return (
      <CollectionPanel>
        <StateMessage
          description="This album may have been removed, or the link is incorrect."
          icon={Disc3}
          primary={{ href: ROUTES.main, label: 'Back to home' }}
          title="Album not found"
        />
      </CollectionPanel>
    )
  }

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
        likedTrackIds={likedTrackIds}
        tracks={tracks}
      />
    </CollectionPanel>
  )
}
