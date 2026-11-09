import { ArtistServerApi } from '@entities/Artist/api/server'
import { decodeRouteSegment, isEntityIdSegment, ROUTES } from '@shared/routes'
import { buildEntityMetadata } from '@shared/utils/entityMetadata'
import { getArtistAvatarUrl } from '@shared/utils/mediaUrl'
import { ArtistPage } from '@views/Artist'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const generateMetadata = async ({
  params,
}: PageProps<'/main/artist/[username]'>): Promise<Metadata> => {
  const username = decodeRouteSegment((await params).username)
  const artist = await ArtistServerApi.getByUsername(username).catch(() => null)

  return buildEntityMetadata({
    title: artist?.username ?? 'Artist',
    description: artist?.bio ?? 'Explore music from this artist.',
    image: artist ? getArtistAvatarUrl(artist.avatar) : undefined,
    path: ROUTES.artist(artist?.username ?? username),
  })
}

export default async function ArtistDetailPage({
  params,
}: PageProps<'/main/artist/[username]'>) {
  const username = decodeRouteSegment((await params).username)

  /**
   * Links used to carry the artist id. An id-shaped segment that names an artist moves to
   * that artist's username URL; otherwise it is looked up as a username like any other.
   * Temporary, not permanent: the username an id resolves to can change.
   */
  if (isEntityIdSegment(username)) {
    const current = await ArtistServerApi.findUsernameById(username)
    if (current) redirect(ROUTES.artist(current))
  }

  return <ArtistPage username={username} />
}
