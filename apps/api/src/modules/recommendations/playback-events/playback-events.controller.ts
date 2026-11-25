import type { UserEntity } from '@modules/users/entities'
import { CurrentUser } from '@modules/users-auth/decorators/current-user.decorator'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { RecordPlaybackEventSwagger } from './decorators/record-playback-event.decorator'
import { RecordPlaybackEventDto, RecordPlaybackEventSchema } from './dtos/record-playback-event.dto'
import { PlaybackEventsService } from './playback-events.service'

@ApiTags('Recommendations')
@UserAuth()
@Controller({ path: 'me/playback-events', version: '1' })
export class PlaybackEventsController {
  constructor(private readonly events: PlaybackEventsService) {}

  @RecordPlaybackEventSwagger()
  @HttpCode(200)
  @Post('')
  record(
    @CurrentUser() user: UserEntity,
    @Body(new ZodValidationPipe(RecordPlaybackEventSchema)) dto: RecordPlaybackEventDto,
  ) {
    return this.events.record(user.id, dto)
  }
}
