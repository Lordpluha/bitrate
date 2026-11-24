import type { UserEntity } from '@modules/users/entities'
import { CurrentUser } from '@modules/users-auth/decorators/current-user.decorator'
import { OptionalUserAuth } from '@modules/users-auth/users-auth.guard'
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { resolveRequestLocale } from '../../../i18n/resolve-request-locale'
import type { SupportAccess } from './can-access-conversation'
import {
  CreateSupportConversationSwagger,
  GetSupportConversationSwagger,
  SendSupportMessageSwagger,
} from './decorators'
import {
  CreateSupportConversationDto,
  CreateSupportConversationSchema,
} from './dtos/create-support-conversation.dto'
import { SendSupportMessageDto, SendSupportMessageSchema } from './dtos/send-support-message.dto'
import { SUPPORT_TOKEN_HEADER } from './guest-token'
import { SupportChatService } from './support-chat.service'
import { SupportConversationsService } from './support-conversations.service'
import { SUPPORT_CREATE_THROTTLE, SUPPORT_MESSAGE_THROTTLE } from './support-limits'

/** The support assistant's web channel (ADR-0074): guests and signed-in listeners. */
@ApiTags('Support')
@OptionalUserAuth()
@Controller({ path: 'support/conversations', version: '1' })
export class SupportConversationsController {
  constructor(
    private readonly conversations: SupportConversationsService,
    private readonly chat: SupportChatService,
  ) {}

  @CreateSupportConversationSwagger()
  @Post()
  @Throttle(SUPPORT_CREATE_THROTTLE)
  create(
    @CurrentUser() user: UserEntity | undefined,
    @Body(new ZodValidationPipe(CreateSupportConversationSchema)) dto: CreateSupportConversationDto,
    @Req() req: Request,
  ) {
    return this.conversations.create({
      audience: dto.audience,
      locale: dto.locale ?? resolveRequestLocale(req),
      ...(user ? { userId: user.id } : {}),
    })
  }

  @GetSupportConversationSwagger()
  @Get(':id')
  view(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity | undefined,
    @Headers(SUPPORT_TOKEN_HEADER) token: string | undefined,
  ) {
    return this.conversations.view(id, accessOf(user, token))
  }

  @SendSupportMessageSwagger()
  @Post(':id/messages')
  @Throttle(SUPPORT_MESSAGE_THROTTLE)
  async send(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity | undefined,
    @Headers(SUPPORT_TOKEN_HEADER) token: string | undefined,
    @Body(new ZodValidationPipe(SendSupportMessageSchema)) dto: SendSupportMessageDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.chat.stream(id, accessOf(user, token), dto.text, req, res)
  }
}

function accessOf(user: UserEntity | undefined, token: string | undefined): SupportAccess {
  return { ...(user ? { userId: user.id } : {}), ...(token ? { token } : {}) }
}
