import type { TranscriptMessage } from '@bitrate/support-core'
import type { PrismaService } from '@infra/prisma/prisma.service'
import type { Prisma } from '@prisma/client'
import { ROLE_FROM_DB, STATE_TO_DB } from './support-enum-maps'
import { SUPPORT_HISTORY_MESSAGES } from './support-limits'
import type { SupportTurnStore, TurnUpdate } from './support-turn-store'

/** `SupportTurnStore` over Prisma. A finished turn is written in one transaction. */
export class PrismaSupportTurnStore implements SupportTurnStore {
  constructor(private readonly prisma: PrismaService) {}

  async addUserMessage(conversationId: string, text: string): Promise<void> {
    await this.prisma.supportMessage.create({ data: { conversationId, role: 'USER', text } })
  }

  async history(conversationId: string): Promise<TranscriptMessage[]> {
    // Newest first, skipping the message this turn just added; the agent appends it itself.
    const rows = await this.prisma.supportMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: SUPPORT_HISTORY_MESSAGES + 1,
      select: { role: true, text: true },
    })
    return rows
      .slice(1)
      .reverse()
      .map((row) => ({ role: ROLE_FROM_DB[row.role], text: row.text }))
  }

  async completeTurn(conversationId: string, update: TurnUpdate): Promise<void> {
    const citations: Prisma.InputJsonArray = update.citations.map((citation) => ({
      chunkId: citation.chunkId,
      title: citation.title,
      ...(citation.url === undefined ? {} : { url: citation.url }),
    }))
    await this.prisma.$transaction(async (tx) => {
      if (update.assistantText !== undefined) {
        await tx.supportMessage.create({
          data: {
            conversationId,
            role: 'ASSISTANT',
            text: update.assistantText,
            ...(citations.length > 0 ? { citations } : {}),
          },
        })
      }
      await tx.supportConversation.update({
        where: { id: conversationId },
        data: {
          state: STATE_TO_DB[update.state],
          inputTokens: { increment: update.usage.inputTokens },
          outputTokens: { increment: update.usage.outputTokens },
          lastMessageAt: new Date(),
        },
      })
      if (update.ticketReason !== undefined) {
        await tx.supportTicket.upsert({
          where: { conversationId },
          create: { conversationId, reason: update.ticketReason },
          update: { reason: update.ticketReason, status: 'OPEN', resolvedAt: null },
        })
      }
    })
  }

  async touch(conversationId: string): Promise<void> {
    await this.prisma.supportConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    })
  }
}
