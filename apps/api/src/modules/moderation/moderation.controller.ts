import type { UserEntity } from '@modules/users/entities'
import { CurrentUser } from '@modules/users-auth/decorators/current-user.decorator'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { ZodValidationPipe } from 'nestjs-zod'
import { CreateReportSwagger } from './decorators'
import { CreateReportDto, CreateReportSchema } from './moderation.dto'
import { ModerationService } from './moderation.service'

@ApiTags('Moderation')
@UserAuth()
@Controller({ path: 'moderation', version: '1' })
export class ModerationController {
  constructor(private readonly moderation: ModerationService) {}

  @CreateReportSwagger()
  @Post('reports')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  create(
    @CurrentUser() user: UserEntity,
    @Body(new ZodValidationPipe(CreateReportSchema)) dto: CreateReportDto,
  ) {
    return this.moderation.createReport(user.id, dto)
  }
}
