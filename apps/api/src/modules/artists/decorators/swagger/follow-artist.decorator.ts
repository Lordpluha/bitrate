import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

export function FollowArtistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Follow an artist' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Artist ID' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Artist followed' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' }),
  )
}

export function UnfollowArtistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Unfollow an artist' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Artist ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Artist unfollowed' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}

export function GetFollowingSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get artists followed by the current user' }),
    ApiResponse({ status: HttpStatus.OK, description: 'List of followed artists' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}
