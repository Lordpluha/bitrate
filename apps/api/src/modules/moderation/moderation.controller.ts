import type { UserAuthRequest } from '@modules/users-auth/types'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import { Body, Controller, Post, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { ZodValidationPipe } from 'nestjs-zod'
import { CreateReportDto, CreateReportSchema } from './moderation.dto'
import { ModerationService } from './moderation.service'

@ApiTags('Moderation')
@UserAuth()
@Controller({ path: 'moderation', version: '1' })
export class ModerationController {
  constructor(private readonly moderation: ModerationService) {}

  @Post('reports')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  create(
    @Req() req: UserAuthRequest,
    @Body(new ZodValidationPipe(CreateReportSchema)) dto: CreateReportDto,
  ) {
    return this.moderation.createReport(req.user.id, dto)
  }
}
