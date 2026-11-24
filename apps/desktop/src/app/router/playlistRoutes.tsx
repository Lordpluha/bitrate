import { CollectionPanel } from '@shared/ui/CollectionHeader'
import { PlaylistPage } from '@views/Playlist'
import { createRoute, Outlet } from '@tanstack/react-router'
import { LikedSongsScreen } from '../routes/LikedSongsScreen'
import { mainRoute } from './mainRoute'
import { ScreenErrorComponent } from './errorComponents'

/** web-player's `main/(playlists)` group: playlist screens share the collection panel. */
const playlistsLayoutRoute = createRoute({
  getParentRoute: () => mainRoute,
  id: 'playlists',
  component: () => (
    <CollectionPanel>
      <Outlet />
    </CollectionPanel>
  ),
})

const likedSongsRoute = createRoute({
  getParentRoute: () => playlistsLayoutRoute,
  path: 'liked-songs',
  errorComponent: ScreenErrorComponent,
  component: LikedSongsScreen,
})

const playlistRoute = createRoute({
  getParentRoute: () => playlistsLayoutRoute,
  path: 'playlist/$id',
  errorComponent: ScreenErrorComponent,
  component: function PlaylistRoute() {
    const { id } = playlistRoute.useParams()
    return <PlaylistPage playlistId={id} />
  },
})

export const playlistRouteTree = playlistsLayoutRoute.addChildren([likedSongsRoute, playlistRoute])
