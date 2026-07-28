import { TrackServerApi } from '@entities/Track/api/server'
import { LikedSongsPlaylist } from '@views/Playlist/ui/LikedSongsPlaylist'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function LikedSongsPage() {
  const tracks = await TrackServerApi.getLiked()

  if (!tracks) notFound()

  return <LikedSongsPlaylist tracks={tracks} />
}
