import { decodeRouteSegment, isEntityIdSegment, ROUTES } from '@shared/routes'
import { AlbumPage } from '@views/Album'
import { ArtistPage } from '@views/Artist'
import { PublicProfilePage } from '@views/Profile'
import { createRoute, redirect } from '@tanstack/react-router'
import { findUsernameById, type UsernameOwner } from './findUsernameById'
import { mainRoute } from './mainRoute'
import { ScreenErrorComponent } from './errorComponents'

type UsernameParams = { params: { username: string } }

/**
 * Moves an id-shaped `$username` segment to the entity's username URL, as web-player's page
 * adapters do on the server. Anything else is looked up as a username by the view itself.
 */
const redirectIdToUsername =
  (owner: UsernameOwner, toRoute: (username: string) => string) =>
  async ({ params }: UsernameParams) => {
    const segment = decodeRouteSegment(params.username)
    if (!isEntityIdSegment(segment)) return

    const username = await findUsernameById(owner, segment)
    if (username) throw redirect({ href: toRoute(username), replace: true })
  }

const albumRoute = createRoute({
  getParentRoute: () => mainRoute,
  path: 'album/$id',
  errorComponent: ScreenErrorComponent,
  component: function AlbumRoute() {
    const { id } = albumRoute.useParams()
    return <AlbumPage albumId={id} />
  },
})

const artistRoute = createRoute({
  getParentRoute: () => mainRoute,
  path: 'artist/$username',
  errorComponent: ScreenErrorComponent,
  beforeLoad: redirectIdToUsername('artists', ROUTES.artist),
  component: function ArtistRoute() {
    const { username } = artistRoute.useParams()
    return <ArtistPage username={decodeRouteSegment(username)} />
  },
})

const userRoute = createRoute({
  getParentRoute: () => mainRoute,
  path: 'user/$username',
  errorComponent: ScreenErrorComponent,
  beforeLoad: redirectIdToUsername('users', ROUTES.user),
  component: function UserRoute() {
    const { username } = userRoute.useParams()
    return <PublicProfilePage username={decodeRouteSegment(username)} />
  },
})

export const entityRoutes = [albumRoute, artistRoute, userRoute]
