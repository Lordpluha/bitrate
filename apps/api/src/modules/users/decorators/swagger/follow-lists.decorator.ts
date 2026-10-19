import { TrackEntity } from '@modules/tracks/entities'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { SafeUserEntity } from '../../entities'

const page = [
  ApiQuery({ name: 'page', required: false, type: Number }),
  ApiQuery({ name: 'limit', required: false, type: Number }),
]

/** Swagger for a user's followers or following list. */
export function GetFollowListSwagger(kind: 'followers' | 'following') {
  return applyDecorators(
    ApiOperation({
      summary: kind === 'followers' ? 'List who follows a user' : 'List whom a user follows',
      description:
        'Visible to everyone while the user keeps `followersVisible` on; the owner always sees their own lists.',
    }),
    ApiParam({ name: 'id', type: String, format: 'uuid' }),
    ...page,
    ApiResponse({ status: HttpStatus.OK, description: 'A page of users' }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'The user keeps these lists private',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
  )
}

/** Swagger for what the people the caller follows last played. */
export function GetFollowingActivitySwagger() {
  return applyDecorators(
    ApiExtraModels(SafeUserEntity, TrackEntity),
    ApiOperation({
      summary: 'What the people the caller follows last played',
      description:
        'One listen per person from the past week, newest first, from people who share their listening activity.',
    }),
    ApiQuery({ name: 'limit', required: false, type: Number, minimum: 1, maximum: 100 }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: {
        type: 'array',
        items: {
          type: 'object',
          required: ['user', 'track', 'listenedAt'],
          properties: {
            user: { $ref: getSchemaPath(SafeUserEntity) },
            track: { $ref: getSchemaPath(TrackEntity) },
            listenedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
