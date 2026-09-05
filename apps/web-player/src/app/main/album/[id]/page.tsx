import { AlbumServerApi } from '@entities/Album/api/server'
import { buildEntityMetadata } from '@shared/utils/entityMetadata'
import { getAlbumCoverUrl } from '@shared/utils/mediaUrl'
import { AlbumPage } from '@views/Album'
import type { Metadata } from 'next'

export const generateMetadata = async ({
  params,
}: PageProps<'/main/album/[id]'>): Promise<Metadata> => {
  const { id } = await params
  const album = await AlbumServerApi.getById(id).catch(() => null)

  return buildEntityMetadata({
    title: album?.title ?? 'Album',
    description: album?.description ?? 'Listen to this album.',
    image: album ? getAlbumCoverUrl(album.cover) : undefined,
    path: `/main/album/${id}`,
  })
}

export default async function AlbumDetailPage({
  params,
}: PageProps<'/main/album/[id]'>) {
  const { id } = await params

  return <AlbumPage albumId={id} />
}
