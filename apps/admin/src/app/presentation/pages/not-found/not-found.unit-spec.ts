import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { SessionStore } from '@application/session'
import type { Permission } from '@domain/access'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { CommandPaletteLauncher } from '@presentation/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotFoundPage } from './not-found'

const en = {
  nav: {
    moderation: 'Moderation',
    releases: 'Releases',
    catalog: 'Catalog',
    users: 'Listeners',
    audit: 'Audit log',
  },
  notFound: {
    title: 'This page doesn’t exist',
    subtitle: 'The link may be old.',
    opened: 'You opened',
    toOverview: 'Go to Overview',
    search: 'Search the console',
    shortcutsTitle: 'Where people usually go',
    shortcutsMeta: 'Sections in your role',
    shortcut: {
      moderation: 'Reports waiting',
      releases: 'Releases waiting',
      catalog: 'Tracks',
      users: 'Listener accounts',
      audit: 'Latest staff actions',
    },
  },
}

describe('NotFoundPage', () => {
  const open = vi.fn()

  beforeEach(() => {
    open.mockReset()
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        }),
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: '**', component: NotFoundPage }]),
        { provide: CommandPaletteLauncher, useValue: { open } },
      ],
    })
  })

  async function render(permissions: Permission[], url = '/moderation/R-9999') {
    TestBed.inject(SessionStore).set({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      email: 'leo@bitrate.me',
      username: 'leo.mod',
      roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
      roleName: 'Moderator',
      permissions,
    })
    await TestBed.inject(Router).navigateByUrl(url)
    const fixture = TestBed.createComponent(NotFoundPage)
    await fixture.whenStable()
    return fixture.nativeElement as HTMLElement
  }

  it('says what happened and shows the address that was opened', async () => {
    const host = await render(['overview:read'])

    expect(host.querySelector('h1')?.textContent).toContain('This page doesn’t exist')
    expect(host.querySelector('code')?.textContent).toBe('/moderation/R-9999')
  })

  it('offers only the shortcuts the operator may open', async () => {
    const host = await render(['reports:read', 'audit:read'])
    const labels = Array.from(host.querySelectorAll('li a')).map((a) => a.getAttribute('href'))

    expect(labels).toEqual(['/moderation', '/audit'])
  })

  it('offers at most four shortcuts', async () => {
    const host = await render([
      'reports:read',
      'releases:read',
      'tracks:read',
      'users:read',
      'audit:read',
    ])

    expect(host.querySelectorAll('li a')).toHaveLength(4)
  })

  it('hides the shortcuts block for an operator with no sections', async () => {
    const host = await render([])

    expect(host.textContent).not.toContain('Where people usually go')
  })

  it('links back to Overview only for an operator who may see it', async () => {
    const without = await render(['reports:read'])
    expect(without.textContent).not.toContain('Go to Overview')

    const withIt = await render(['overview:read'])
    expect(withIt.querySelector('a[href="/"]')?.textContent).toContain('Go to Overview')
  })

  it('opens the command palette from Search', async () => {
    const host = await render(['overview:read'])
    host.querySelector<HTMLButtonElement>('button')?.click()

    expect(open).toHaveBeenCalled()
  })
})
