import { PrismaService } from '@infra/prisma/prisma.service'
import type { UserAuthRequest } from '@modules/users-auth/types'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import { Body, Controller, Post, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { createZodDto, ZodValidationPipe } from 'nestjs-zod'
import { z } from 'zod'

const CreateReportSchema = z.object({
  entityType: z.enum(['track', 'album', 'playlist', 'artist', 'podcast', 'episode', 'user']),
  entityId: z.uuid(),
  reason: z.string().min(3).max(100),
  details: z.string().max(2000).optional(),
})
class CreateReportDto extends createZodDto(CreateReportSchema) {}

@ApiTags('Moderation')
@UserAuth()
@Controller({ path: 'moderation', version: '1' })
export class ModerationController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('reports')
  create(
    @Req() req: UserAuthRequest,
    @Body(new ZodValidationPipe(CreateReportSchema)) dto: CreateReportDto,
  ) {
    return this.prisma.moderationReport.create({ data: { reporterId: req.user.id, ...dto } })
  }
}
