import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { FriendEntity, FriendRequestEntity, SendFriendRequestResultEntity } from '../../entities'

const unauthorized = ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Missing or invalid session',
})
const requestId = ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Request id' })
const requestNotFound = ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'No such request for the caller',
})

/** Swagger for the caller's friends. */
export function GetFriendsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "List the caller's friends with their presence",
      description:
        'Listening friends first, then online, away and offline. `nowPlaying` is set only while a track plays and the friend shares their listening outside a private session.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: FriendEntity, isArray: true }),
    unauthorized,
  )
}

/** Swagger for pending friend requests. */
export function GetFriendRequestsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'List pending friend requests sent to or by the caller' }),
    ApiQuery({ name: 'direction', required: false, enum: ['incoming', 'outgoing'] }),
    ApiResponse({ status: HttpStatus.OK, type: FriendRequestEntity, isArray: true }),
    unauthorized,
  )
}

/** Swagger for sending a friend request. */
export function SendFriendRequestSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Send a friend request',
      description:
        'Idempotent: sending again returns the pending request. When the other user already sent one, it is accepted instead.',
    }),
    ApiParam({ name: 'id', type: String, format: 'uuid', description: 'User to befriend' }),
    ApiResponse({ status: HttpStatus.OK, type: SendFriendRequestResultEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot befriend yourself' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Already friends' }),
    unauthorized,
  )
}

/** Swagger for accepting a friend request. */
export function AcceptFriendRequestSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Accept a friend request sent to the caller' }),
    requestId,
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Now friends' }),
    requestNotFound,
    unauthorized,
  )
}

/** Swagger for declining a friend request. */
export function DeclineFriendRequestSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Decline a friend request sent to the caller' }),
    requestId,
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Request declined' }),
    requestNotFound,
    unauthorized,
  )
}

/** Swagger for cancelling a sent friend request. */
export function CancelFriendRequestSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Cancel a friend request the caller sent' }),
    requestId,
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Request cancelled' }),
    requestNotFound,
    unauthorized,
  )
}

/** Swagger for removing a friend. */
export function RemoveFriendSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove a friend', description: 'Follows are left as they are.' }),
    ApiParam({ name: 'userId', type: String, format: 'uuid' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No longer friends' }),
    unauthorized,
  )
}
