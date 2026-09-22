import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { CreateReportDto } from '../moderation.dto'

/** File a moderation report against a track, album, playlist, artist, podcast, episode, or user. */
export function CreateReportSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'File a moderation report',
      description:
        'Reporting the same entity again while an earlier report is still active returns that report instead of creating a duplicate. Rate-limited per reporter.',
    }),
    ApiBody({ type: CreateReportDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'The report (new or the existing active one)',
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot report your own account' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Reportable target not found' }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'Too many moderation reports',
    }),
  )
}
