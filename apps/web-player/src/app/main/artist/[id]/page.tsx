import { ArtistServerApi } from '@entities/Artist/api/server'
import { buildEntityMetadata } from '@shared/utils/entityMetadata'
import { getArtistAvatarUrl } from '@shared/utils/mediaUrl'
import { ArtistPage } from '@views/Artist'
import type { Metadata } from 'next'

export const generateMetadata = async ({
  params,
}: PageProps<'/main/artist/[id]'>): Promise<Metadata> => {
  const { id } = await params
  const artist = await ArtistServerApi.getById(id).catch(() => null)

  return buildEntityMetadata({
    title: artist?.username ?? 'Artist',
    description: artist?.bio ?? 'Explore music from this artist.',
    image: artist ? getArtistAvatarUrl(artist.avatar) : undefined,
    path: `/main/artist/${id}`,
  })
}

export default async function ArtistDetailPage({
  params,
}: PageProps<'/main/artist/[id]'>) {
  const { id } = await params

  return <ArtistPage artistId={id} />
}
