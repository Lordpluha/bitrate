import type { Audience, Locale } from '@bitrate/support-core'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { canAccessConversation, type SupportAccess } from './can-access-conversation'
import { SupportConversationEntity } from './entities/support-conversation.entity'
import { SUPPORT_ERRORS } from './errors/support.errors'
import { createGuestToken, hashGuestToken } from './guest-token'
import type { SupportConversationRow } from './support-conversation-row'
import {
  AUDIENCE_FROM_DB,
  AUDIENCE_TO_DB,
  CHANNEL_FROM_DB,
  STATE_FROM_DB,
} from './support-enum-maps'

/** Creates support conversations and opens them for their owner. */
@Injectable()
export class SupportConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** A guest gets a token to open the conversation later; a listener's is tied to them. */
  async create(input: { audience: Audience; locale: Locale; userId?: string }) {
    const token = input.userId ? undefined : createGuestToken()
    const row = await this.prisma.supportConversation.create({
      data: {
        audience: AUDIENCE_TO_DB[input.audience],
        locale: input.locale,
        ...(input.userId ? { userId: input.userId } : {}),
        ...(token ? { guestTokenHash: hashGuestToken(token) } : {}),
      },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    return { conversation: SupportConversationEntity.from(row), ...(token ? { token } : {}) }
  }

  async view(id: string, access: SupportAccess): Promise<SupportConversationEntity> {
    const row = await this.prisma.supportConversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (!(row && canAccessConversation(row, access))) {
      throw new NotFoundException(SUPPORT_ERRORS.CONVERSATION_NOT_FOUND)
    }
    return SupportConversationEntity.from(row)
  }

  /** The conversation as a turn needs it; 404 for a missing or foreign one. */
  async forTurn(id: string, access: SupportAccess): Promise<SupportConversationRow> {
    const row = await this.prisma.supportConversation.findUnique({ where: { id } })
    if (!(row && canAccessConversation(row, access))) {
      throw new NotFoundException(SUPPORT_ERRORS.CONVERSATION_NOT_FOUND)
    }
    return {
      id: row.id,
      audience: AUDIENCE_FROM_DB[row.audience],
      locale: toLocale(row.locale),
      channel: CHANNEL_FROM_DB[row.channel],
      state: STATE_FROM_DB[row.state],
      inputTokens: row.inputTokens,
      outputTokens: row.outputTokens,
    }
  }
}

function toLocale(value: string): Locale {
  return value === 'uk' || value === 'pl' ? value : 'en'
}
