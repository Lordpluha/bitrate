import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { SessionStore } from '@application/session'
import { SupportInboxRepository } from '@domain/support'
import { StubSupportInboxRepository, supportConversation } from '@testing/support'
import { provideTestTransloco } from '@testing/transloco'
import { beforeEach, describe, expect, it } from 'vitest'
import { SupportInbox } from './support-inbox'

const routes: Routes = [{ path: 'support', component: SupportInbox }]

describe('SupportInbox', () => {
  let harness: RouterTestingHarness
  let inbox: StubSupportInboxRepository
  const host = () => harness.routeNativeElement as HTMLElement

  async function open(url: string) {
    await harness.navigateByUrl(url, SupportInbox)
    await harness.fixture.whenStable()
  }

  beforeEach(async () => {
    inbox = new StubSupportInboxRepository()
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        ...provideTestTransloco(),
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideLocationMocks(),
        { provide: SupportInboxRepository, useValue: inbox },
      ],
    })
    TestBed.inject(SessionStore).set({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3399',
      email: 'ops@bitrate.me',
      username: 'ops',
      roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
      roleName: 'MODERATOR',
      permissions: ['support:read'],
    })
    harness = await RouterTestingHarness.create()
  })

  it('lists open tickets by default, with the reason, last message and state', async () => {
    inbox.listMock.mockResolvedValue({
      items: [supportConversation()],
      total: 1,
      page: 1,
      limit: 20,
    })

    await open('/support')

    expect(inbox.listMock).toHaveBeenCalledWith({ page: 1, limit: 20, filter: { status: 'open' } })
    const link = host().querySelector<HTMLAnchorElement>(
      `a[href="/support/${supportConversation().id}"]`,
    )
    expect(link?.textContent).toContain('Payout is late')
    expect(host().textContent).toContain('Payouts arrive monthly.')
    expect(host().textContent).toContain('Waiting for an operator')
  })

  it('reads every filter from the URL', async () => {
    inbox.listMock.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 })

    await open('/support?status=all&channel=telegram&audience=listener&page=2')

    expect(inbox.listMock).toHaveBeenCalledWith({
      page: 2,
      limit: 20,
      filter: { channel: 'telegram', audience: 'listener' },
    })
  })

  it('says nobody is waiting when the default view is empty', async () => {
    inbox.listMock.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 })

    await open('/support')

    expect(host().textContent).toContain('Nobody is waiting')
  })

  it('offers to clear narrowed filters that match nothing', async () => {
    inbox.listMock.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 })

    await open('/support?channel=whatsapp')

    expect(host().textContent).toContain('No conversations match these filters')
  })

  it('shows the load failure with a retry', async () => {
    inbox.listMock.mockRejectedValue(new Error('offline'))

    await open('/support')

    expect(host().textContent).toContain("Couldn't load the inbox.")
  })
})
