import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it } from 'vitest'
import { SupportInboxRepository } from '@domain/support'
import { StubSupportInboxRepository, SUPPORT_ID, supportConversation } from '@testing/support'
import { ReplyToSupportConversationUseCase } from './reply-to-support-conversation.use-case'
import { ResolveSupportConversationUseCase } from './resolve-support-conversation.use-case'

describe('support use cases', () => {
  let inbox: StubSupportInboxRepository

  beforeEach(() => {
    TestBed.resetTestingModule()
    inbox = new StubSupportInboxRepository()
    TestBed.configureTestingModule({
      providers: [{ provide: SupportInboxRepository, useValue: inbox }],
    })
  })

  it('sends the reply without surrounding whitespace', async () => {
    inbox.replyMock.mockResolvedValue(supportConversation({ state: 'operator' }))

    const updated = await TestBed.inject(ReplyToSupportConversationUseCase).execute({
      id: SUPPORT_ID,
      text: '  We are on it \n',
    })

    expect(inbox.replyMock).toHaveBeenCalledWith({ id: SUPPORT_ID, text: 'We are on it' })
    expect(updated.state).toBe('operator')
  })

  it('resolves an open ticket', async () => {
    const resolved = supportConversation({ state: 'resolved' })
    inbox.resolveMock.mockResolvedValue(resolved)

    await expect(
      TestBed.inject(ResolveSupportConversationUseCase).execute(supportConversation()),
    ).resolves.toBe(resolved)
    expect(inbox.resolveMock).toHaveBeenCalledWith(SUPPORT_ID)
  })

  it('leaves a resolved ticket alone', async () => {
    const conversation = supportConversation({
      ticket: { ...supportConversation().ticket, status: 'resolved' },
    })

    await expect(
      TestBed.inject(ResolveSupportConversationUseCase).execute(conversation),
    ).resolves.toBe(conversation)
    expect(inbox.resolveMock).not.toHaveBeenCalled()
  })
})
