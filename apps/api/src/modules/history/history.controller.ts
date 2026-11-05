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
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  ClearHistorySwagger,
  GetHistorySwagger,
  RecordHistorySwagger,
  RemoveTrackHistorySwagger,
} from './decorators'
import { HistoryService } from './history.service'

/** Represents the history controller. */
@ApiTags('History')
@UserAuth()
@Controller({ path: 'history', version: '1' })
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  /** Runs the record operation. */
  @RecordHistorySwagger()
  @Post('tracks/:trackId')
  record(@CurrentUser() user: UserEntity, @Param('trackId', ParseUUIDPipe) trackId: string) {
    return this.historyService.record(user.id, trackId)
  }

  /** Runs the get history operation. */
  @GetHistorySwagger()
  @Get('')
  getHistory(
    @CurrentUser() user: UserEntity,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.historyService.getHistory(user.id, page, limit)
  }

  /** Runs the clear all operation. */
  @ClearHistorySwagger()
  @HttpCode(204)
  @Delete('')
  clearAll(@CurrentUser() user: UserEntity) {
    return this.historyService.clearAll(user.id)
  }

  /** Runs the remove track operation. */
  @RemoveTrackHistorySwagger()
  @HttpCode(200)
  @Delete('tracks/:trackId')
  removeTrack(@CurrentUser() user: UserEntity, @Param('trackId', ParseUUIDPipe) trackId: string) {
    return this.historyService.removeTrack(user.id, trackId)
  }
}
