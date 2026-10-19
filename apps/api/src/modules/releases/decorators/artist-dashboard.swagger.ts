import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ArtistDashboardEntity } from '../entities/artist-dashboard.entity'

export function ArtistDashboardSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Summarize the artist's workspace for the dashboard",
      description:
        'Current release with its blocker count, items needing attention, catalogue counts, upcoming planned dates and open tasks. Read from saved data only.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistDashboardEntity }),
  )
}
