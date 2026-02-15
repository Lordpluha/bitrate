import { TrackServerApi } from '@entities/Track/api/server'
import { LikedSongsPlaylist } from '@views/Playlist/ui/LikedSongsPlaylist'
import { notFound } from 'next/navigation'

export default async function LikedSongsPage() {
  const resp = await TrackServerApi.getLiked()

  if (!resp.data) notFound()

  return <LikedSongsPlaylist tracks={resp?.data} />
}
