import { SkipAudit } from '@infra/observability/skip-audit.decorator'
import {
  AuditContext,
  type AuditContextValue,
  BatchIdsDto,
  BatchIdsSchema,
} from '@modules/admin/shared'
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
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminModerationService } from './admin-moderation.service'
import {
  DismissReportsBatchSwagger,
  GetReportSwagger,
  ListReportsSwagger,
  ResolveReportsBatchSwagger,
  UpdateReportSwagger,
} from './decorators'
import {
  type ListReportsQueryDto,
  ListReportsQuerySchema,
  type UpdateReportDto,
  UpdateReportSchema,
} from './dtos'

/** Operator-facing moderation report queue. */
@ApiTags('Admin Moderation')
@AdminAuth()
@Controller({ path: 'admin/moderation/reports', version: '1' })
export class AdminModerationController {
  constructor(private readonly moderation: AdminModerationService) {}

  /** Runs the list reports operation. */
  @RequirePermission('reports:read')
  @ListReportsSwagger()
  @Get('')
  list(@Query(new ZodValidationPipe(ListReportsQuerySchema)) query: ListReportsQueryDto) {
    return this.moderation.findAll(query)
  }

  /**
   * Runs the batch resolve operation. Declared before `:id` so the literal `batch` segment is
   * never read as an id. `@SkipAudit` because the service writes one audit row per report.
   */
  @RequirePermission('reports:advance')
  @ResolveReportsBatchSwagger()
  @SkipAudit()
  @HttpCode(HttpStatus.OK)
  @Post('batch/resolve')
  resolveMany(
    @Body(new ZodValidationPipe(BatchIdsSchema)) body: BatchIdsDto,
    @CurrentStaff() staff: AuthenticatedStaff,
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.moderation.advanceMany(body.ids, 'RESOLVED', staff.id, auditContext)
  }

  /** Runs the batch dismiss operation (status `REJECTED`); see {@link resolveMany}. */
  @RequirePermission('reports:advance')
  @DismissReportsBatchSwagger()
  @SkipAudit()
  @HttpCode(HttpStatus.OK)
  @Post('batch/dismiss')
  dismissMany(
    @Body(new ZodValidationPipe(BatchIdsSchema)) body: BatchIdsDto,
    @CurrentStaff() staff: AuthenticatedStaff,
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.moderation.advanceMany(body.ids, 'REJECTED', staff.id, auditContext)
  }

  /** Runs the get report operation. */
  @RequirePermission('reports:read')
  @GetReportSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.moderation.findById(id)
  }

  /** Runs the update report operation. */
  @RequirePermission('reports:advance')
  @UpdateReportSwagger()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateReportSchema)) dto: UpdateReportDto,
  ) {
    return this.moderation.updateStatus(id, dto)
  }
}
