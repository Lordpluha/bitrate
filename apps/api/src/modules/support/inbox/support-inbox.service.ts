import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import type { SupportTicket } from '@prisma/client'
import { SUPPORT_ERRORS } from '../chat/errors/support.errors'
import {
  type PaginatedSupportInboxEntity,
  SupportInboxConversationEntity,
  SupportInboxItemEntity,
  type SupportInboxRow,
} from './entities'
import { type SupportInboxQuery, supportInboxWhere } from './support-inbox-filter'

/**
 * The operator side of support conversations (#573). Lives in the `support` scope because it
 * writes the support tables; the admin controller only calls it.
 */
@Injectable()
export class SupportInboxService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: SupportInboxQuery): Promise<PaginatedSupportInboxEntity> {
    const { page, limit, skip } = normalizePagination(query.page, query.limit)
    const where = supportInboxWhere(query)
    const [rows, total] = await Promise.all([
      this.prisma.supportConversation.findMany({
        where,
        include: { ticket: true, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
        orderBy: [{ lastMessageAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.supportConversation.count({ where }),
    ])
    return {
      data: rows.filter(hasTicket).map((row) => SupportInboxItemEntity.from(row)),
      total,
      page,
      limit,
    }
  }

  async view(id: string): Promise<SupportInboxConversationEntity> {
    const row = await this.prisma.supportConversation.findUnique({
      where: { id },
      include: { ticket: true, messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (!(row && hasTicket(row))) throw new NotFoundException(SUPPORT_ERRORS.CONVERSATION_NOT_FOUND)
    return SupportInboxConversationEntity.fromHistory(row)
  }

  /** The user sees the reply in the originating channel; the web widget picks it up on its next load. */
  async reply(id: string, text: string): Promise<SupportInboxConversationEntity> {
    await this.requireTicket(id)
    await this.prisma.$transaction([
      this.prisma.supportMessage.create({ data: { conversationId: id, role: 'OPERATOR', text } }),
      this.prisma.supportConversation.update({
        where: { id },
        data: { state: 'OPERATOR', lastMessageAt: new Date() },
      }),
      this.prisma.supportTicket.update({
        where: { conversationId: id },
        data: { status: 'OPEN', resolvedAt: null },
      }),
    ])
    return await this.view(id)
  }

  /** Closes the ticket; the assistant answers the user's next message again. */
  async resolve(id: string): Promise<SupportInboxConversationEntity> {
    await this.requireTicket(id)
    await this.prisma.$transaction([
      this.prisma.supportConversation.update({ where: { id }, data: { state: 'RESOLVED' } }),
      this.prisma.supportTicket.update({
        where: { conversationId: id },
        data: { status: 'RESOLVED', resolvedAt: new Date() },
      }),
    ])
    return await this.view(id)
  }

  private async requireTicket(conversationId: string): Promise<void> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { conversationId },
      select: { id: true },
    })
    if (!ticket) throw new NotFoundException(SUPPORT_ERRORS.CONVERSATION_NOT_FOUND)
  }
}

function hasTicket(row: SupportInboxRow): row is SupportInboxRow & { ticket: SupportTicket } {
  return row.ticket !== null
}
