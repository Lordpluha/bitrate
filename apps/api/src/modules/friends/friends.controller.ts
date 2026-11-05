import type { UserEntity } from '@modules/users/entities'
import { CurrentUser } from '@modules/users-auth/decorators/current-user.decorator'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import * as z from 'zod'
import {
  AcceptFriendRequestSwagger,
  CancelFriendRequestSwagger,
  DeclineFriendRequestSwagger,
  GetFriendRequestsSwagger,
  GetFriendsSwagger,
  RemoveFriendSwagger,
  SendFriendRequestSwagger,
} from './decorators'
import { type FriendRequestDirection, FriendsService } from './friends.service'

const DirectionSchema = z.enum(['incoming', 'outgoing']).default('incoming')

/** Friend requests and friendships; every route acts for the signed-in user. */
@ApiTags('Friends')
@UserAuth()
@Controller({ version: '1' })
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @GetFriendsSwagger()
  @Get('me/friends')
  list(@CurrentUser() user: UserEntity) {
    return this.friends.listFriends(user.id)
  }

  @GetFriendRequestsSwagger()
  @Get('me/friend-requests')
  requests(
    @CurrentUser() user: UserEntity,
    @Query('direction', new ZodValidationPipe(DirectionSchema)) direction: FriendRequestDirection,
  ) {
    return this.friends.listRequests(user.id, direction)
  }

  @RemoveFriendSwagger()
  @HttpCode(204)
  @Delete('me/friends/:userId')
  remove(@CurrentUser() user: UserEntity, @Param('userId', ParseUUIDPipe) userId: string) {
    return this.friends.removeFriend(user.id, userId)
  }

  @SendFriendRequestSwagger()
  @HttpCode(200)
  @Post('users/:id/friend-request')
  send(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.friends.sendRequest(user.id, id)
  }

  @AcceptFriendRequestSwagger()
  @HttpCode(204)
  @Post('friend-requests/:id/accept')
  accept(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.friends.accept(user.id, id)
  }

  @DeclineFriendRequestSwagger()
  @HttpCode(204)
  @Post('friend-requests/:id/decline')
  decline(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.friends.decline(user.id, id)
  }

  @CancelFriendRequestSwagger()
  @HttpCode(204)
  @Delete('friend-requests/:id')
  cancel(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.friends.cancel(user.id, id)
  }
}
