import { AdminAuth, RequirePermission } from '@modules/admin-auth'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AdminOverviewService } from './admin-overview.service'
import { GetOverviewSwagger } from './decorators'

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
}
