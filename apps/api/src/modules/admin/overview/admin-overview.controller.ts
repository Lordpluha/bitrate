import { AdminAuth, RequirePermission } from '@modules/admin-auth'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminOverviewService } from './admin-overview.service'
import { GetOverviewSeriesSwagger, GetOverviewSwagger } from './decorators'
import { type GetOverviewSeriesQueryDto, GetOverviewSeriesQuerySchema } from './dtos'

/** The operator landing dashboard — read-only aggregate summary. */
@ApiTags('Admin Overview')
@AdminAuth()
@Controller({ path: 'admin/overview', version: '1' })
export class AdminOverviewController {
  constructor(private readonly overview: AdminOverviewService) {}

  /** Runs the get overview operation. */
  @RequirePermission('overview:read')
  @GetOverviewSwagger()
  @Get('')
  get() {
    return this.overview.getOverview()
  }

  /** Runs the get overview series operation. */
  @RequirePermission('overview:read')
  @GetOverviewSeriesSwagger()
  @Get('series')
  getSeries(
    @Query(new ZodValidationPipe(GetOverviewSeriesQuerySchema)) query: GetOverviewSeriesQueryDto,
  ) {
    return this.overview.getSeries(query.days)
  }
}
