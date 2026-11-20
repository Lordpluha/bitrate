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
import type { NotInterestedType, TasteExclusionType } from '@prisma/client'
import {
  ExcludeFromTasteSwagger,
  IncludeInTasteSwagger,
  ListNotInterestedSwagger,
  ListTasteExclusionsSwagger,
  MarkNotInterestedSwagger,
  UnmarkNotInterestedSwagger,
} from './decorators'
import { NOT_INTERESTED_KINDS, TASTE_EXCLUSION_KINDS } from './dtos'
import { ParseKindPipe } from './parse-kind.pipe'
import { TasteService } from './taste.service'

const notInterestedKind = new ParseKindPipe(NOT_INTERESTED_KINDS)
const exclusionKind = new ParseKindPipe(TASTE_EXCLUSION_KINDS)
const optionalInt = () => new ParseIntPipe({ optional: true })

/** "Not interested" and "Don't use for my taste" (docs/specs/recommendations.md). */
@ApiTags('Recommendations')
@UserAuth()
@Controller({ path: 'me/taste', version: '1' })
export class TasteController {
  constructor(private readonly taste: TasteService) {}

  @ListNotInterestedSwagger()
  @Get('not-interested')
  listNotInterested(
    @CurrentUser() user: UserEntity,
    @Query('page', optionalInt()) page?: number,
    @Query('limit', optionalInt()) limit?: number,
  ) {
    return this.taste.listNotInterested(user.id, page, limit)
  }

  @MarkNotInterestedSwagger()
  @HttpCode(204)
  @Put('not-interested/:kind/:id')
  markNotInterested(
    @CurrentUser() user: UserEntity,
    @Param('kind', notInterestedKind) kind: NotInterestedType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.taste.markNotInterested(user.id, kind, id)
  }

  @UnmarkNotInterestedSwagger()
  @HttpCode(204)
  @Delete('not-interested/:kind/:id')
  unmarkNotInterested(
    @CurrentUser() user: UserEntity,
    @Param('kind', notInterestedKind) kind: NotInterestedType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.taste.unmarkNotInterested(user.id, kind, id)
  }

  @ListTasteExclusionsSwagger()
  @Get('exclusions')
  listExclusions(
    @CurrentUser() user: UserEntity,
    @Query('page', optionalInt()) page?: number,
    @Query('limit', optionalInt()) limit?: number,
  ) {
    return this.taste.listExclusions(user.id, page, limit)
  }

  @ExcludeFromTasteSwagger()
  @HttpCode(204)
  @Put('exclusions/:kind/:id')
  exclude(
    @CurrentUser() user: UserEntity,
    @Param('kind', exclusionKind) kind: TasteExclusionType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.taste.exclude(user.id, kind, id)
  }

  @IncludeInTasteSwagger()
  @HttpCode(204)
  @Delete('exclusions/:kind/:id')
  include(
    @CurrentUser() user: UserEntity,
    @Param('kind', exclusionKind) kind: TasteExclusionType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.taste.include(user.id, kind, id)
  }
}
