import { AlbumPage } from '@views/Album'

export default async function AlbumDetailPage({
  params,
}: PageProps<'/main/album/[id]'>) {
  const { id } = await params

  return <AlbumPage albumId={id} />
}
