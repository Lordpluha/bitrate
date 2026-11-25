import { AdminAuth, RequirePermission } from '@modules/admin-auth'
import { SupportInboxService } from '@modules/support'
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
import {
  GetSupportConversationSwagger,
  ListSupportConversationsSwagger,
  ReplySupportConversationSwagger,
  ResolveSupportConversationSwagger,
} from './decorators'
import {
  type ListSupportConversationsQueryDto,
  ListSupportConversationsQuerySchema,
  type ReplySupportConversationDto,
  ReplySupportConversationSchema,
} from './dtos'

/** The operators' support inbox (#573). */
@ApiTags('Admin Support')
@AdminAuth()
@Controller({ path: 'admin/support/conversations', version: '1' })
export class AdminSupportController {
  constructor(private readonly inbox: SupportInboxService) {}

  /** Lists handed-off conversations. */
  @RequirePermission('support:read')
  @ListSupportConversationsSwagger()
  @Get('')
  list(
    @Query(new ZodValidationPipe(ListSupportConversationsQuerySchema))
    query: ListSupportConversationsQueryDto,
  ) {
    return this.inbox.list(query)
  }

  /** Opens one conversation with its history. */
  @RequirePermission('support:read')
  @GetSupportConversationSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.inbox.view(id)
  }

  /** Replies as an operator. */
  @RequirePermission('support:reply')
  @ReplySupportConversationSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/messages')
  reply(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReplySupportConversationSchema)) body: ReplySupportConversationDto,
  ) {
    return this.inbox.reply(id, body.text)
  }

  /** Resolves the ticket. */
  @RequirePermission('support:reply')
  @ResolveSupportConversationSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/resolve')
  resolve(@Param('id', ParseUUIDPipe) id: string) {
    return this.inbox.resolve(id)
  }
}
