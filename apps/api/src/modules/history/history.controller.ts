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
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { HistoryService } from './history.service'

/** Represents the history controller. */
@ApiTags('History')
@UserAuth()
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  /** Runs the record operation. */
  @ApiOperation({ summary: 'Record a track listen' })
  @ApiParam({ name: 'trackId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Recorded' })
  @Post('tracks/:trackId')
  record(@Req() req: UserAuthRequest, @Param('trackId', ParseUUIDPipe) trackId: string) {
    return this.historyService.record(req.user.id, trackId)
  }

  /** Runs the get history operation. */
  @ApiOperation({ summary: 'Get listening history (deduplicated, most recent first)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'History entries with track info' })
  @Get('')
  getHistory(
    @Req() req: UserAuthRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.historyService.getHistory(req.user.id, page, limit)
  }

  /** Runs the clear all operation. */
  @ApiOperation({ summary: 'Clear all listening history' })
  @ApiResponse({ status: 204, description: 'History cleared' })
  @HttpCode(204)
  @Delete('')
  clearAll(@Req() req: UserAuthRequest) {
    return this.historyService.clearAll(req.user.id)
  }

  /** Runs the remove track operation. */
  @ApiOperation({ summary: 'Remove a specific track from history' })
  @ApiParam({ name: 'trackId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Track removed from history' })
  @HttpCode(200)
  @Delete('tracks/:trackId')
  removeTrack(@Req() req: UserAuthRequest, @Param('trackId', ParseUUIDPipe) trackId: string) {
    return this.historyService.removeTrack(req.user.id, trackId)
  }
}
