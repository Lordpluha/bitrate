import { CacheModule } from '@infra/cache/cache.module'
import { Module } from '@nestjs/common'
import { PlaybackSessionService } from './playback-session.service'

/**
 * Playback sessions on their own, so the tracks module (which opens and checks them) and
 * users-auth (which revokes them on logout and password reset) share one provider without
 * importing each other.
 */
@Module({
  imports: [CacheModule],
  providers: [PlaybackSessionService],
  exports: [PlaybackSessionService],
})
export class PlaybackSessionsModule {}
