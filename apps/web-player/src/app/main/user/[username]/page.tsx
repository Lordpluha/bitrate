import { findUsernameByUserId } from '@entities/User/api/server'
import { decodeRouteSegment, isEntityIdSegment, ROUTES } from '@shared/routes'
import { PublicProfilePage } from '@views/Profile'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const generateMetadata = async ({
  params,
}: PageProps<'/main/user/[username]'>): Promise<Metadata> => ({
  title: decodeRouteSegment((await params).username),
})

export default async function PublicProfileRoute({
  params,
}: PageProps<'/main/user/[username]'>) {
  const username = decodeRouteSegment((await params).username)

  /**
   * Links used to carry the user id. An id-shaped segment that names a user moves to that
   * user's username URL; otherwise it is looked up as a username like any other. Temporary,
   * not permanent: the username an id resolves to can change.
   */
  if (isEntityIdSegment(username)) {
    const current = await findUsernameByUserId(username)
    if (current) redirect(ROUTES.user(current))
  }

  return <PublicProfilePage username={username} />
}
