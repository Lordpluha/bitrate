import { PlaylistPage } from '@views/Playlist'

type PlaylistDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function PlaylistDetailPage({
  params,
}: PlaylistDetailPageProps) {
  const { id } = await params

  return <PlaylistPage playlistId={id} />
}
