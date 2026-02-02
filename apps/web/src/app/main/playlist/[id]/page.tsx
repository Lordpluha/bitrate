import { PlaylistPage } from '@views/Playlist'

export default async function PlaylistDetailPage({
  params,
}: PageProps<'/main/playlist/[id]'>) {
  const { id } = await params
  return <PlaylistPage playlistId={id} />
}
