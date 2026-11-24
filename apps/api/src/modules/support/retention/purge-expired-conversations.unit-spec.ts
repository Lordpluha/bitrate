import { describe, expect, it, jest } from '@jest/globals'
import { type ConversationPurger, purgeExpiredConversations } from './purge-expired-conversations'

describe('purgeExpiredConversations', () => {
  it('deletes conversations whose last message is more than 90 days old', async () => {
    const deleteMany = jest.fn<ConversationPurger['supportConversation']['deleteMany']>(() =>
      Promise.resolve({ count: 3 }),
    )

    const count = await purgeExpiredConversations(
      { supportConversation: { deleteMany } },
      new Date('2026-11-23T00:00:00Z'),
    )

    expect(count).toBe(3)
    expect(deleteMany).toHaveBeenCalledWith({
      where: { lastMessageAt: { lt: new Date('2026-08-25T00:00:00Z') } },
    })
  })
})
