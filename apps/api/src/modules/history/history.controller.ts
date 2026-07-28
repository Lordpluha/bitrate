import type { UserAuthRequest } from '@modules/users-auth/types'
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
  Req,
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
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  /** Runs the record operation. */
  @RecordHistorySwagger()
  @Post('tracks/:trackId')
  record(@Req() req: UserAuthRequest, @Param('trackId', ParseUUIDPipe) trackId: string) {
    return this.historyService.record(req.user.id, trackId)
  }

  /** Runs the get history operation. */
  @GetHistorySwagger()
  @Get('')
  getHistory(
    @Req() req: UserAuthRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.historyService.getHistory(req.user.id, page, limit)
  }

  /** Runs the clear all operation. */
  @ClearHistorySwagger()
  @HttpCode(204)
  @Delete('')
  clearAll(@Req() req: UserAuthRequest) {
    return this.historyService.clearAll(req.user.id)
  }

  /** Runs the remove track operation. */
  @RemoveTrackHistorySwagger()
  @HttpCode(200)
  @Delete('tracks/:trackId')
  removeTrack(@Req() req: UserAuthRequest, @Param('trackId', ParseUUIDPipe) trackId: string) {
    return this.historyService.removeTrack(req.user.id, trackId)
  }
}
