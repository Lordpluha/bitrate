import { PlaylistServerApi } from '@entities/Playlist/api/server'
import { buildEntityMetadata } from '@shared/utils/entityMetadata'
import { getPlaylistCoverUrl } from '@shared/utils/mediaUrl'
import { PlaylistPage } from '@views/Playlist'
import type { Metadata } from 'next'

export const generateMetadata = async ({
  params,
}: PageProps<'/main/playlist/[id]'>): Promise<Metadata> => {
  const { id } = await params
  const playlist = await PlaylistServerApi.getMetadataById(id).catch(() => null)

  return buildEntityMetadata({
    title: playlist?.title ?? 'Playlist',
    description: playlist?.description ?? 'Listen to this playlist.',
    image: playlist ? getPlaylistCoverUrl(playlist.cover) : undefined,
    path: `/main/playlist/${id}`,
  })
}

export default async function PlaylistDetailPage({
  params,
}: PageProps<'/main/playlist/[id]'>) {
  const { id } = await params

  return <PlaylistPage playlistId={id} />
}
