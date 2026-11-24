/** How long a support conversation is kept after its last message (#567). */
const SUPPORT_RETENTION_DAYS = 90

/** The one Prisma call the purge makes; `PrismaService` satisfies it. */
export interface ConversationPurger {
  supportConversation: {
    deleteMany(args: { where: { lastMessageAt: { lt: Date } } }): PromiseLike<{ count: number }>
  }
}

/**
 * Deletes conversations idle for longer than the retention period; their messages and ticket
 * go with them (cascade). Returns how many were deleted.
 */
export async function purgeExpiredConversations(
  prisma: ConversationPurger,
  now: Date = new Date(),
): Promise<number> {
  const cutoff = new Date(now.getTime() - SUPPORT_RETENTION_DAYS * 86_400_000)
  const { count } = await prisma.supportConversation.deleteMany({
    where: { lastMessageAt: { lt: cutoff } },
  })
  return count
}
