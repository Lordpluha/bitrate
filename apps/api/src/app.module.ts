import { StorageModule } from '@infra/storage/storage.module'
import { AlbumsModule } from '@modules/albums/albums.module'
import { ArtistProfileModule } from '@modules/artist-profile'
import { ArtistWorkspaceModule } from '@modules/artist-workspace'
import { ArtistsModule } from '@modules/artists/artists.module'
import { ArtistsAuthModule } from '@modules/artists-auth/artists-auth.module'
import { DiscoveryModule } from '@modules/discovery/discovery.module'
import { FriendsModule } from '@modules/friends/friends.module'
import { HistoryModule } from '@modules/history/history.module'
import { MeModule } from '@modules/me/me.module'
import { ModerationModule } from '@modules/moderation/moderation.module'
import { NotificationsModule } from '@modules/notifications/notifications.module'
import { PlaylistsModule } from '@modules/playlists/playlists.module'
import { ReleasePublishingModule, ReleasesModule } from '@modules/releases'
import { SearchModule } from '@modules/search/search.module'
import { TracksModule } from '@modules/tracks/tracks.module'
import { UsersModule } from '@modules/users/users.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { AppCoreModule } from './app-core.module'

/** Root of the public API process: the listener and artist surfaces. Operators: `AdminAppModule`. */
@Module({
  imports: [
    AppCoreModule,
    StorageModule,
    UsersAuthModule,
    ArtistsModule,
    UsersModule,
    TracksModule,
    PlaylistsModule,
    AlbumsModule,
    ArtistsAuthModule,
    SearchModule,
    HistoryModule,
    NotificationsModule,
    FriendsModule,
    DiscoveryModule,
    MeModule,
    ReleasesModule,
    ReleasePublishingModule,
    ArtistProfileModule,
    ArtistWorkspaceModule,
    ModerationModule,
  ],
})
export class AppModule {}
