import { vi } from 'vitest'
import type { Page } from '@domain/shared'
import {
  type ListSupportConversationsQuery,
  type ReplyToSupportConversationInput,
  type SupportConversation,
  type SupportInboxItem,
  SupportInboxRepository,
} from '@domain/support'

export const SUPPORT_ID = '0196f1a0-0000-7000-8000-000000000001'

/** A handed-off web conversation from a guest artist, waiting for an operator. */
export function supportConversation(
  overrides: Partial<SupportConversation> = {},
): SupportConversation {
  const asked = {
    id: '0196f1a0-0000-7000-8000-0000000000a1',
    role: 'user' as const,
    text: 'My payout is late',
    citations: [],
    createdAt: new Date('2026-11-24T09:00:00.000Z'),
  }
  const answered = {
    id: '0196f1a0-0000-7000-8000-0000000000a2',
    role: 'assistant' as const,
    text: 'Payouts arrive monthly.',
    citations: [{ title: 'Payouts', url: '/help/payouts' }],
    createdAt: new Date('2026-11-24T09:00:05.000Z'),
  }
  return {
    id: SUPPORT_ID,
    audience: 'artist',
    channel: 'web',
    locale: 'uk',
    state: 'waiting_operator',
    userId: null,
    ticket: {
      reason: 'Payout is late',
      status: 'open',
      createdAt: new Date('2026-11-24T09:00:06.000Z'),
      resolvedAt: null,
    },
    lastMessage: answered,
    lastMessageAt: answered.createdAt,
    createdAt: asked.createdAt,
    messages: [asked, answered],
    ...overrides,
  }
}

/** The inbox port with every method a `vi.fn`, so a spec stubs only what it uses. */
export class StubSupportInboxRepository extends SupportInboxRepository {
  readonly listMock =
    vi.fn<(query: ListSupportConversationsQuery) => Promise<Page<SupportInboxItem>>>()
  readonly getByIdMock = vi.fn<(id: string) => Promise<SupportConversation>>()
  readonly replyMock =
    vi.fn<(input: ReplyToSupportConversationInput) => Promise<SupportConversation>>()
  readonly resolveMock = vi.fn<(id: string) => Promise<SupportConversation>>()

  override list(query: ListSupportConversationsQuery): Promise<Page<SupportInboxItem>> {
    return this.listMock(query)
  }

  override getById(id: string): Promise<SupportConversation> {
    return this.getByIdMock(id)
  }

  override reply(input: ReplyToSupportConversationInput): Promise<SupportConversation> {
    return this.replyMock(input)
  }

  override resolve(id: string): Promise<SupportConversation> {
    return this.resolveMock(id)
  }
}
