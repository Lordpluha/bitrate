import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { RecordPlaybackEventDto } from '../dtos/record-playback-event.dto'
import { PlaybackEventRecordedEntity } from '../entities/playback-event-recorded.entity'

export function RecordPlaybackEventSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Report a finished play',
      description:
        'Sent when a play ends, is skipped or is replaced. Feeds recommendations only; listening ' +
        'history is still recorded when the play starts. Nothing is stored during a private session.',
    }),
    ApiBody({ type: RecordPlaybackEventDto }),
    ApiResponse({ status: 200, description: 'Accepted', type: PlaybackEventRecordedEntity }),
    ApiResponse({
      status: 400,
      description: 'Invalid event, or reported too late or ahead of time',
    }),
    ApiResponse({ status: 404, description: 'The track is not in the catalogue' }),
  )
}
