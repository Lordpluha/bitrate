'use client'

import { useAlbum } from '@entities/Album'
import { type TrackEntity, useLikedTracks } from '@entities/Track'
import { getAlbumCoverUrl } from '@shared/utils/mediaUrl'
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
      <div className="h-full overflow-y-auto custom-scrollbar p-6 text-text-subdued">
        Loading album...
      </div>
    )
  }

  if (isError || !album) {
    return (
      <div className="h-full overflow-y-auto custom-scrollbar p-6">
        <div className="rounded-lg bg-surface p-6 text-text-subdued">
          Album not found.
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
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
    </div>
  )
}
