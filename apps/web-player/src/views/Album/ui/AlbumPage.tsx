'use client'

import { useAlbum, useLikeAlbum, useUnlikeAlbum } from '@entities/Album'
import { selectMusicPlayer, usePlayerStore } from '@entities/Player'
import { type TrackEntity, TracksList, useLikedTracks } from '@entities/Track'
import { showApiSuccessToast } from '@shared/api/feedback'
import { useImageColor } from '@shared/hooks/useImageColor'
import { BackButton } from '@shared/ui/BackButton'
import { DateUtils } from '@shared/utils/DateUtils'
import { getAlbumCoverUrl } from '@shared/utils/mediaUrl'
import { TimeUtils } from '@shared/utils/TimeUtils'
import { ArrowLeft, CheckCircle, Heart } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState } from 'react'

const getAlbumDuration = (tracks: TrackEntity[]) =>
  tracks.reduce((duration, track) => duration + (track.duration ?? 0), 0)

export const AlbumPage = ({ albumId }: { albumId: string }) => {
  const musicPlayer = usePlayerStore(selectMusicPlayer)
  const playPlaylist = usePlayerStore((state) => state.playPlaylist)
  const { data, isError, isPending } = useAlbum(albumId)
  const { data: likedTracks } = useLikedTracks(1, 1000, undefined, {
    staleTime: 5 * 60_000,
  })
  const likeAlbum = useLikeAlbum()
  const unlikeAlbum = useUnlikeAlbum()
  const [isLiked, setIsLiked] = useState(false)
  const album = data
  const tracks = album?.tracks ?? []
  const albumPlaybackId = `album:${albumId}`
  const likedTrackIds = useMemo(
    () => new Set((likedTracks ?? []).map((track) => track.id)),
    [likedTracks],
  )
  const coverUrl = getAlbumCoverUrl(album?.cover)
  const [r, g, b] = useImageColor(coverUrl)

  const brighten = (value: number, amount: number, cap = 255) =>
    Math.min(Math.round(value * amount), cap)
  const dim = (value: number, amount: number) => Math.round(value * amount)

  const topColor = `rgb(${brighten(r, 2.1)}, ${brighten(g, 2.1)}, ${brighten(b, 2.1)})`
  const midColor = `rgb(${brighten(r, 1.25, 210)}, ${brighten(g, 1.25, 210)}, ${brighten(b, 1.25, 210)})`
  const deepColor = `rgb(${dim(r, 0.45)}, ${dim(g, 0.45)}, ${dim(b, 0.45)})`

  const handleLikeToggle = async () => {
    if (!album) return

    if (isLiked) {
      await unlikeAlbum.mutateAsync({
        params: {
          path: { id: album.id },
        },
      })
      setIsLiked(false)
      showApiSuccessToast('Album removed from library')
      return
    }

    await likeAlbum.mutateAsync({
      params: {
        path: { id: album.id },
      },
    })
    setIsLiked(true)
    showApiSuccessToast('Album saved to library')
  }

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
      <section
        className="relative min-h-85 p-6 text-white max-[1024px]:px-4 max-[1024px]:py-5"
        style={{
          background: `linear-gradient(180deg, ${topColor} 0%, ${midColor} 42%, ${deepColor} 100%)`,
        }}
      >
        <BackButton className="absolute left-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 transition-colors hover:bg-black/60 max-[1024px]:static">
          <ArrowLeft className="text-white" size={20} />
        </BackButton>

        <div className="flex h-full flex-row items-end gap-6 pt-14 max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-4 max-[1024px]:pt-4 max-[640px]:items-center">
          <Image
            alt={album.title}
            className="h-58 w-58 rounded object-cover shadow-2xl max-[1024px]:h-52 max-[1024px]:w-52 max-[640px]:h-44 max-[640px]:w-44"
            height={232}
            src={coverUrl}
            unoptimized
            width={232}
          />
          <div className="flex min-w-0 flex-col gap-2 pb-4 max-[1024px]:pb-0 max-[640px]:w-full max-[640px]:items-center max-[640px]:text-center">
            <span className="text-sm font-bold uppercase tracking-wide text-white/80 max-[1024px]:text-xs">
              Album
            </span>
            <h1 className="max-w-full break-words text-6xl font-bold leading-tight max-[1024px]:text-4xl max-[640px]:text-3xl">
              {album.title}
            </h1>
            {album.description && (
              <p className="max-w-180 text-sm text-white/70">
                {album.description}
              </p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm max-[640px]:justify-center">
              <span className="font-semibold">{album.artistId}</span>
              {album.releaseDate && (
                <>
                  <span className="text-white/50">•</span>
                  <span>{DateUtils.formatDate(album.releaseDate)}</span>
                </>
              )}
              <span className="text-white/50">•</span>
              <span>{tracks.length} songs</span>
              <span className="text-white/50">•</span>
              <span>{TimeUtils.formatDuration(getAlbumDuration(tracks))}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-4 py-4 sm:px-6">
        <button
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-text hover:bg-white/15 disabled:opacity-60"
          disabled={likeAlbum.isPending || unlikeAlbum.isPending}
          onClick={handleLikeToggle}
          type="button"
        >
          {isLiked ? (
            <CheckCircle className="fill-green-500 text-green-500" size={18} />
          ) : (
            <Heart size={18} />
          )}
          {isLiked ? 'Saved' : 'Save'}
        </button>
      </section>

      {tracks.length === 0 ? (
        <div className="p-4 text-text-subdued sm:p-8">
          No tracks in this album
        </div>
      ) : (
        <TracksList
          activeTrackId={musicPlayer.currentTrack?.id}
          isPlaybackContextActive={
            musicPlayer.currentPlaylistId === albumPlaybackId
          }
          likedTrackIds={likedTrackIds}
          onPlayTrack={(track, index) =>
            playPlaylist({
              currentPlaylistId: albumPlaybackId,
              currentPlaylistName: album.title,
              startTrack: track,
              startTrackIndex: index,
              tracks,
            })
          }
          tracks={tracks}
        />
      )}
    </div>
  )
}
