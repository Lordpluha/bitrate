import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { ArtistWithFollowersCountEntity, FollowedArtistEntity } from '../../entities'

/** Runs the follow artist swagger operation. */
export function FollowArtistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Follow an artist' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Artist ID' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Artist followed',
      type: ArtistWithFollowersCountEntity,
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' }),
  )
}

/** Runs the unfollow artist swagger operation. */
export function UnfollowArtistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Unfollow an artist' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Artist ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Artist unfollowed',
      type: ArtistWithFollowersCountEntity,
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}

/** Runs the get following swagger operation. */
export function GetFollowingSwagger() {
  return applyDecorators(
    ApiExtraModels(FollowedArtistEntity),
    ApiOperation({ summary: 'Get artists followed by the current user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of followed artists',
      schema: paginatedResponseSchema(FollowedArtistEntity),
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}
