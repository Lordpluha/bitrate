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
import type { TasteExclusionType } from '@prisma/client'
import {
  ExcludeFromTasteSwagger,
  IncludeInTasteSwagger,
  ListTasteExclusionsSwagger,
} from './decorators'
import { ParseKindPipe } from './parse-kind.pipe'
import { TasteExclusionsService } from './taste-exclusions.service'
import { TASTE_EXCLUSION_KINDS } from './taste-params'

const kindPipe = new ParseKindPipe(TASTE_EXCLUSION_KINDS)

/** "Don't use for my taste" (docs/specs/recommendations.md). */
@ApiTags('Recommendations')
@UserAuth()
@Controller({ path: 'me/taste/exclusions', version: '1' })
export class TasteExclusionsController {
  constructor(private readonly exclusions: TasteExclusionsService) {}

  @ListTasteExclusionsSwagger()
  @Get('')
  list(
    @CurrentUser() user: UserEntity,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.exclusions.list(user.id, page, limit)
  }

  @ExcludeFromTasteSwagger()
  @HttpCode(204)
  @Put(':kind/:id')
  exclude(
    @CurrentUser() user: UserEntity,
    @Param('kind', kindPipe) kind: TasteExclusionType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.exclusions.exclude(user.id, kind, id)
  }

  @IncludeInTasteSwagger()
  @HttpCode(204)
  @Delete(':kind/:id')
  include(
    @CurrentUser() user: UserEntity,
    @Param('kind', kindPipe) kind: TasteExclusionType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.exclusions.include(user.id, kind, id)
  }
}
