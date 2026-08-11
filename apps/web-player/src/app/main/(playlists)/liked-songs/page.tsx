import { TrackServerApi } from '@entities/Track/api/server'
import { LikedSongsPlaylist } from '@views/Playlist/ui/LikedSongsPlaylist'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Liked Songs',
}

export const dynamic = 'force-dynamic'

export default async function LikedSongsPage() {
  const tracks = await TrackServerApi.getLiked()

  return <LikedSongsPlaylist tracks={tracks} />
}
