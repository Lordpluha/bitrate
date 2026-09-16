import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { SessionStore } from '@application/session'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppSidebar } from './app-sidebar'

const ADMIN_STAFF = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

describe('AppSidebar', () => {
  beforeEach(() => {
    localStorage.clear()
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    })
    /** ADMIN sees every guarded item by identity — see `hasPermission`. */
    TestBed.inject(SessionStore).set(ADMIN_STAFF)
  })

  /**
   * Guards a bug that types, lint and every other test were blind to: with a host box, the
   * `<aside>` inside it is a `height: auto` block child, so the rail stopped at the last menu
   * item and dragged the footer up with it. `display: contents` removes the host box and makes
   * the `<aside>` the shell's flex item, which is also what makes its `shrink-0` mean anything.
   */
  it('removes its own host box so the aside is the flex item', async () => {
    const fixture = TestBed.createComponent(AppSidebar)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.classList.contains('contents')).toBe(true)
    expect(host.querySelector('aside')).not.toBeNull()
  })

  it('renders every section caption and its destinations', async () => {
    const fixture = TestBed.createComponent(AppSidebar)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.textContent).toContain('Operations')
    expect(host.textContent).toContain('Accounts')
    expect(host.textContent).toContain('System')
    expect(host.querySelectorAll('nav a')).toHaveLength(6)
  })

  /** The footer is pinned by `nav` taking the slack, not by absolute positioning. */
  it('lets the nav absorb the free space so the footer sits at the bottom', async () => {
    const fixture = TestBed.createComponent(AppSidebar)
    await fixture.whenStable()

    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav')

    expect(nav?.classList.contains('flex-1')).toBe(true)
  })

  it('hides an item when the operator lacks its permission', async () => {
    TestBed.inject(SessionStore).set({
      ...ADMIN_STAFF,
      roleName: 'MODERATOR',
      permissions: ['reports:read', 'artists:read', 'users:read', 'audit:read'],
    })

    const fixture = TestBed.createComponent(AppSidebar)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.textContent).not.toContain('Catalog pipeline')
    expect(host.querySelectorAll('nav a')).toHaveLength(4)
  })

  it('hides Roles when the operator lacks roles:read', async () => {
    TestBed.inject(SessionStore).set({
      ...ADMIN_STAFF,
      roleName: 'MODERATOR',
      permissions: ['reports:read', 'artists:read', 'users:read', 'audit:read'],
    })

    const fixture = TestBed.createComponent(AppSidebar)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.textContent).not.toContain('Roles')
  })

  it('shows Roles when the operator holds roles:read', async () => {
    TestBed.inject(SessionStore).set({
      ...ADMIN_STAFF,
      roleName: 'MODERATOR',
      permissions: ['roles:read'],
    })

    const fixture = TestBed.createComponent(AppSidebar)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.textContent).toContain('Roles')
  })
})
