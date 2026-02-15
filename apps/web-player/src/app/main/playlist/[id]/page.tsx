import type { WithTracks } from '@entities/Playlist'
import { PlaylistServerApi } from '@entities/Playlist/api/server/PlaylistApi.server'
import type { PlaylistEntity } from '@entities/Playlist/models/schemas/Playlist.entity'
import { PlaylistPage } from '@views/Playlist'

export default async function PlaylistDetailPage({
  params,
}: PageProps<'/main/playlist/[id]'>) {
  const { id } = await params
	const resp = await PlaylistServerApi.getPlaylists(id)

  return <PlaylistPage playlist={resp.data as WithTracks<PlaylistEntity>} playlistId={id} />
}
