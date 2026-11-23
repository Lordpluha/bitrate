import type { UserEntity } from '@modules/users/entities'
import { CurrentUser } from '@modules/users-auth/decorators/current-user.decorator'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { NotInterestedType } from '@prisma/client'
import {
  ListNotInterestedSwagger,
  MarkNotInterestedSwagger,
  UnmarkNotInterestedSwagger,
} from './decorators'
import { NotInterestedService } from './not-interested.service'
import { ParseKindPipe } from './parse-kind.pipe'
import { NOT_INTERESTED_KINDS } from './taste-params'

const kindPipe = new ParseKindPipe(NOT_INTERESTED_KINDS)

/** "Not interested" (docs/specs/recommendations.md). */
@ApiTags('Recommendations')
@UserAuth()
@Controller({ path: 'me/taste/not-interested', version: '1' })
export class NotInterestedController {
  constructor(private readonly notInterested: NotInterestedService) {}

  @ListNotInterestedSwagger()
  @Get('')
  list(
    @CurrentUser() user: UserEntity,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.notInterested.list(user.id, page, limit)
  }

  @MarkNotInterestedSwagger()
  @HttpCode(204)
  @Put(':kind/:id')
  mark(
    @CurrentUser() user: UserEntity,
    @Param('kind', kindPipe) kind: NotInterestedType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notInterested.mark(user.id, kind, id)
  }

  @UnmarkNotInterestedSwagger()
  @HttpCode(204)
  @Delete(':kind/:id')
  unmark(
    @CurrentUser() user: UserEntity,
    @Param('kind', kindPipe) kind: NotInterestedType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notInterested.unmark(user.id, kind, id)
  }
}
