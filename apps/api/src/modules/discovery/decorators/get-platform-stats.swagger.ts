import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { PlatformStatsEntity } from '../entities/platform-stats.entity'

/** Public platform totals (artists, listeners, playable tracks), cached for a few minutes. */
export function GetPlatformStatsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get public platform totals' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Live artist and listener accounts and playable tracks',
      type: PlatformStatsEntity,
    }),
  )
}
