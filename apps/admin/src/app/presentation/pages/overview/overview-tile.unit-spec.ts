import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { SessionStore } from '@application/session'
import type { Staff } from '@domain/staff'
import { describe, expect, it } from 'vitest'
import { OverviewTileCard } from './overview-tile'
import type { OverviewTile } from './overview-tiles'

const MODERATOR: Staff = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'mod@bitrate.me',
  username: 'mod',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'MODERATOR',
  permissions: [],
}

const LINKED_TILE: OverviewTile = {
  id: 'reports-open',
  label: 'Open reports',
  value: 3,
  link: { path: '/moderation', permission: 'reports:read' },
}

const PLAIN_TILE: OverviewTile = {
  id: 'tracks-stuck',
  label: 'Stuck tracks',
  value: 1,
  hint: 'Past 30 min in processing',
}

function create(tile: OverviewTile, staff: Staff | null = null): { host: HTMLElement } {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), provideRouter([])],
  })
  TestBed.inject(SessionStore).set(staff)

  const fixture = TestBed.createComponent(OverviewTileCard)
  fixture.componentRef.setInput('tile', tile)
  fixture.detectChanges()

  return { host: fixture.nativeElement as HTMLElement }
}

describe('OverviewTileCard', () => {
  it('renders a linked tile as an anchor whose accessible text carries the value and label', () => {
    const { host } = create(LINKED_TILE, { ...MODERATOR, permissions: ['reports:read'] })
    const link = host.querySelector('a')

    expect(link).not.toBeNull()
    expect(link?.querySelector('[aria-hidden="true"]')).toBeNull()
    expect(link?.textContent).toContain('3')
    expect(link?.textContent).toContain('Open reports')
  })

  it('falls back to a plain, non-interactive card when the operator lacks the link permission', () => {
    const { host } = create(LINKED_TILE, { ...MODERATOR, permissions: [] })

    expect(host.querySelector('a')).toBeNull()
    const card = host.querySelector('div')
    expect(card?.querySelector('[aria-hidden="true"]')).toBeNull()
    expect(card?.textContent).toContain('Open reports')
  })

  it('renders a link-less tile as a plain card with its hint exposed as text, not hidden', () => {
    const { host } = create(PLAIN_TILE)

    expect(host.querySelector('a')).toBeNull()
    const card = host.querySelector('div')
    expect(card?.querySelector('[aria-hidden="true"]')).toBeNull()
    expect(card?.textContent).toContain('Stuck tracks')
    expect(card?.textContent).toContain('Past 30 min in processing')
  })
})
