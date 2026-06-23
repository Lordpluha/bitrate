import { TrackServerApi } from '@entities/Track/api/server'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { LikedSongsPlaylist } from '@views/Playlist/ui/LikedSongsPlaylist'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function LikedSongsPage() {
  const resp = await TrackServerApi.getLiked()

  if (!resp.data) notFound()

  return <LikedSongsPlaylist tracks={resp.data as TrackEntity[]} />
}
