import { AlbumPage } from '@views/Album'

type AlbumDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function AlbumDetailPage({
  params,
}: AlbumDetailPageProps) {
  const { id } = await params

  return <AlbumPage albumId={id} />
}
