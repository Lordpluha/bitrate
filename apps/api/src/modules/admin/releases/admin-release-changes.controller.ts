import { AuditContext, type AuditContextValue } from '@modules/admin/shared'
import type { AuthenticatedStaff } from '@modules/admin-auth'
import { AdminAuth, CurrentStaff, RequirePermission } from '@modules/admin-auth'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminReleasesService } from './admin-releases.service'
import {
  DecideReleaseChangesSwagger,
  GetReleaseChangeRequestSwagger,
  ListReleaseChangeRequestsSwagger,
  ReleaseChangeStatsSwagger,
} from './decorators'
import {
  type DecideReleaseChangesDto,
  DecideReleaseChangesSchema,
  type ListReleaseChangeRequestsQueryDto,
  ListReleaseChangeRequestsQuerySchema,
} from './dtos/release-change-review.dto'

/** Operator review of changes artists propose to published releases. */
@ApiTags('Admin Releases')
@AdminAuth()
@Controller({ path: 'admin/release-changes', version: '1' })
export class AdminReleaseChangesController {
  constructor(private readonly releases: AdminReleasesService) {}

  @RequirePermission('releases:read')
  @ListReleaseChangeRequestsSwagger()
  @Get('')
  list(
    @Query(new ZodValidationPipe(ListReleaseChangeRequestsQuerySchema))
    query: ListReleaseChangeRequestsQueryDto,
  ) {
    return this.releases.listChangeRequests(query)
  }

  @RequirePermission('releases:read')
  @ReleaseChangeStatsSwagger()
  @Get('stats')
  stats() {
    return this.releases.changeRequestStats()
  }

  @RequirePermission('releases:read')
  @GetReleaseChangeRequestSwagger()
  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.releases.changeRequest(id)
  }

  @RequirePermission('releases:review')
  @DecideReleaseChangesSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/decide')
  decide(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(DecideReleaseChangesSchema)) body: DecideReleaseChangesDto,
    @AuditContext() audit: AuditContextValue = {},
  ) {
    return this.releases.decideChanges(id, staff.id, body, audit)
  }
}
