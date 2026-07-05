import { PlaylistServerApi } from '@entities/Playlist/api/server/PlaylistApi.server'
import { PlaylistPage } from '@views/Playlist'

type PlaylistDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function PlaylistDetailPage({
  params,
}: PlaylistDetailPageProps) {
  const { id } = await params
  const resp = await PlaylistServerApi.getPlaylists(id)

  return <PlaylistPage playlist={resp.data} />
}
