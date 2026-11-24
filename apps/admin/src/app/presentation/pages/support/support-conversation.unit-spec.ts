import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { SessionStore } from '@application/session'
import {
  GetSupportConversationUseCase,
  ReplyToSupportConversationUseCase,
  ResolveSupportConversationUseCase,
} from '@application/support'
import type { Permission } from '@domain/access'
import { ResourceNotFoundError } from '@domain/shared'
import type { SupportConversation } from '@domain/support'
import { supportConversation } from '@testing/support'
import { provideTestTransloco } from '@testing/transloco'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SupportConversationPage } from './support-conversation'

const getConversation = vi.fn<() => Promise<SupportConversation>>()
const reply = vi.fn<(input: { id: string; text: string }) => Promise<SupportConversation>>()
const resolve = vi.fn<(conversation: SupportConversation) => Promise<SupportConversation>>()

function operator(permissions: Permission[]) {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    email: 'ops@bitrate.me',
    username: 'ops',
    roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
    roleName: 'MODERATOR',
    permissions,
  }
}

async function render(permissions: Permission[] = ['support:read', 'support:reply']) {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [
      ...provideTestTransloco(),
      provideZonelessChangeDetection(),
      provideRouter([]),
      { provide: GetSupportConversationUseCase, useValue: { execute: getConversation } },
      { provide: ReplyToSupportConversationUseCase, useValue: { execute: reply } },
      { provide: ResolveSupportConversationUseCase, useValue: { execute: resolve } },
    ],
  })
  TestBed.inject(SessionStore).set(operator(permissions))
  const fixture = TestBed.createComponent(SupportConversationPage)
  await fixture.whenStable()
  return { fixture, host: fixture.nativeElement as HTMLElement }
}

const button = (root: ParentNode | null, text: string) =>
  Array.from(root?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(
    (candidate) => candidate.textContent?.trim() === text,
  )

async function type(fixture: { whenStable(): Promise<unknown> }, host: HTMLElement, text: string) {
  const field = host.querySelector<HTMLTextAreaElement>('#support-reply')
  if (!field) throw new Error('no reply field')
  field.value = text
  field.dispatchEvent(new Event('input'))
  field.dispatchEvent(new Event('blur'))
  await fixture.whenStable()
}

describe('SupportConversationPage', () => {
  beforeEach(() => {
    getConversation.mockReset()
    reply.mockReset()
    resolve.mockReset()
  })

  it('shows the ticket reason and the history with its sources', async () => {
    getConversation.mockResolvedValue(supportConversation())
    const { host } = await render()

    expect(host.querySelector('h1')?.textContent).toContain('Payout is late')
    expect(host.textContent).toContain('My payout is late')
    expect(host.textContent).toContain('Payouts arrive monthly.')
    expect(host.querySelector<HTMLAnchorElement>('a[href="/help/payouts"]')?.textContent).toBe(
      'Payouts',
    )
  })

  it('sends a reply and shows the conversation the API returns', async () => {
    const base = supportConversation()
    getConversation.mockResolvedValue(base)
    const operatorMessage = {
      id: '0196f1a0-0000-7000-8000-0000000000a3',
      role: 'operator' as const,
      text: 'We are on it',
      citations: [],
      createdAt: new Date('2026-11-24T10:00:00.000Z'),
    }
    reply.mockResolvedValue({
      ...base,
      state: 'operator',
      messages: [...base.messages, operatorMessage],
    })
    const { fixture, host } = await render()

    await type(fixture, host, 'We are on it')
    button(host, 'Send reply')?.click()
    await fixture.whenStable()

    expect(reply).toHaveBeenCalledWith({ id: '', text: 'We are on it' })
    expect(host.textContent).toContain('With an operator')
    expect(host.querySelector<HTMLTextAreaElement>('#support-reply')?.value).toBe('')
  })

  it('refuses a blank reply before calling the API', async () => {
    getConversation.mockResolvedValue(supportConversation())
    const { fixture, host } = await render()

    await type(fixture, host, '   ')
    button(host, 'Send reply')?.click()
    await fixture.whenStable()

    expect(reply).not.toHaveBeenCalled()
    expect(host.querySelector('#support-reply-error')?.textContent).toContain(
      'Write a reply first.',
    )
  })

  it('keeps the draft and says so when the reply fails', async () => {
    getConversation.mockResolvedValue(supportConversation())
    reply.mockRejectedValue(new Error('offline'))
    const { fixture, host } = await render()

    await type(fixture, host, 'Hello')
    button(host, 'Send reply')?.click()
    await fixture.whenStable()

    expect(host.textContent).toContain("Couldn't send the reply. Try again.")
    expect(host.querySelector<HTMLTextAreaElement>('#support-reply')?.value).toBe('Hello')
  })

  it('asks before resolving, and resolves on confirm', async () => {
    getConversation.mockResolvedValue(supportConversation())
    resolve.mockResolvedValue(
      supportConversation({
        state: 'resolved',
        ticket: { ...supportConversation().ticket, status: 'resolved' },
      }),
    )
    const { fixture, host } = await render()
    const dialog = () => document.body.querySelector('[data-slot="dialog-content"]')

    button(host, 'Resolve')?.click()
    await fixture.whenStable()
    expect(dialog()?.textContent).toContain('Resolve this conversation?')
    expect(resolve).not.toHaveBeenCalled()

    button(dialog(), 'Resolve conversation')?.click()
    await fixture.whenStable()

    expect(resolve).toHaveBeenCalledTimes(1)
    expect(button(host, 'Resolve')).toBeUndefined()
  })

  it('is read-only without support:reply', async () => {
    getConversation.mockResolvedValue(supportConversation())
    const { host } = await render(['support:read'])

    expect(host.querySelector('#support-reply')).toBeNull()
    expect(button(host, 'Resolve')).toBeUndefined()
    expect(host.textContent).toContain('You can read this conversation but not reply to it.')
  })

  it('shows not found for a conversation that was never handed off', async () => {
    getConversation.mockRejectedValue(new ResourceNotFoundError())
    const { host } = await render()

    expect(host.textContent).toContain('Conversation not found')
  })

  it('offers a retry when loading fails', async () => {
    getConversation.mockRejectedValueOnce(new Error('offline'))
    getConversation.mockResolvedValueOnce(supportConversation())
    const { fixture, host } = await render()

    expect(host.textContent).toContain("Couldn't load the conversation.")
    button(host, 'Try again')?.click()
    await fixture.whenStable()

    expect(host.querySelector('h1')?.textContent).toContain('Payout is late')
  })
})
