import { AdminAuth } from '@modules/admin-auth'
import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminModerationService } from './admin-moderation.service'
import { GetReportSwagger, ListReportsSwagger, UpdateReportSwagger } from './decorators'
import {
  type ListReportsQueryDto,
  ListReportsQuerySchema,
  type UpdateReportDto,
  UpdateReportSchema,
} from './dtos'

/** Operator-facing moderation report queue. */
@ApiTags('Admin Moderation')
@AdminAuth('ADMIN', 'MODERATOR')
@Controller({ path: 'admin/moderation/reports', version: '1' })
export class AdminModerationController {
  constructor(private readonly moderation: AdminModerationService) {}

  /** Runs the list reports operation. */
  @ListReportsSwagger()
  @Get('')
  list(@Query(new ZodValidationPipe(ListReportsQuerySchema)) query: ListReportsQueryDto) {
    return this.moderation.findAll(query)
  }

  /** Runs the get report operation. */
  @GetReportSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.moderation.findById(id)
  }

  /** Runs the update report operation. */
  @UpdateReportSwagger()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateReportSchema)) dto: UpdateReportDto,
  ) {
    return this.moderation.updateStatus(id, dto)
  }
}
