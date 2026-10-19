import type { UserAuthRequest } from '@modules/users-auth/types'
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
  Req,
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
  list(@Req() req: UserAuthRequest) {
    return this.friends.listFriends(req.user.id)
  }

  @GetFriendRequestsSwagger()
  @Get('me/friend-requests')
  requests(
    @Req() req: UserAuthRequest,
    @Query('direction', new ZodValidationPipe(DirectionSchema)) direction: FriendRequestDirection,
  ) {
    return this.friends.listRequests(req.user.id, direction)
  }

  @RemoveFriendSwagger()
  @HttpCode(204)
  @Delete('me/friends/:userId')
  remove(@Req() req: UserAuthRequest, @Param('userId', ParseUUIDPipe) userId: string) {
    return this.friends.removeFriend(req.user.id, userId)
  }

  @SendFriendRequestSwagger()
  @HttpCode(200)
  @Post('users/:id/friend-request')
  send(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.friends.sendRequest(req.user.id, id)
  }

  @AcceptFriendRequestSwagger()
  @HttpCode(204)
  @Post('friend-requests/:id/accept')
  accept(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.friends.accept(req.user.id, id)
  }

  @DeclineFriendRequestSwagger()
  @HttpCode(204)
  @Post('friend-requests/:id/decline')
  decline(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.friends.decline(req.user.id, id)
  }

  @CancelFriendRequestSwagger()
  @HttpCode(204)
  @Delete('friend-requests/:id')
  cancel(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.friends.cancel(req.user.id, id)
  }
}
