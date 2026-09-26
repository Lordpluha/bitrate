import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { SessionStore } from '@application/session'
import type { Staff } from '@domain/staff'
import { describe, expect, it } from 'vitest'
import { OverviewStatusStrip } from './overview-status-strip'
import type { OverviewStatusItem } from './overview-status'

const MODERATOR: Staff = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'mod@bitrate.me',
  username: 'mod',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'MODERATOR',
  permissions: [],
}

const LINKED_ITEM: OverviewStatusItem = {
  id: 'reports-open',
  label: 'Open',
  value: 3,
  link: { path: '/moderation', permission: 'reports:read' },
}

const STUCK_ITEM: OverviewStatusItem = {
  id: 'tracks-stuck',
  label: 'Stuck',
  value: 1,
  hint: 'Past 30 min in processing',
}

type CreateInput = {
  items: OverviewStatusItem[]
  urgentId?: string | null
  staff?: Staff | null
}

function create({ items, urgentId = null, staff = null }: CreateInput): { host: HTMLElement } {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), provideRouter([])],
  })
  TestBed.inject(SessionStore).set(staff)

  const fixture = TestBed.createComponent(OverviewStatusStrip)
  fixture.componentRef.setInput('items', items)
  fixture.componentRef.setInput('urgentId', urgentId)
  fixture.detectChanges()

  return { host: fixture.nativeElement as HTMLElement }
}

describe('OverviewStatusStrip', () => {
  it('renders a linked item as an anchor carrying the value and label', () => {
    const { host } = create({
      items: [LINKED_ITEM],
      staff: { ...MODERATOR, permissions: ['reports:read'] },
    })
    const link = host.querySelector('a')

    expect(link).not.toBeNull()
    expect(link?.textContent).toContain('3')
    expect(link?.textContent).toContain('Open')
    expect(link?.getAttribute('href')).toBe('/moderation')
  })

  it('falls back to plain text when the operator lacks the link permission', () => {
    const { host } = create({ items: [LINKED_ITEM], staff: { ...MODERATOR, permissions: [] } })

    expect(host.querySelector('a')).toBeNull()
    expect(host.textContent).toContain('Open')
  })

  it('renders a link-less item as plain text with its hint exposed, not hidden', () => {
    const { host } = create({ items: [STUCK_ITEM] })

    expect(host.querySelector('a')).toBeNull()
    expect(host.textContent).toContain('Stuck')
    expect(host.textContent).toContain('Past 30 min in processing')
  })

  it('highlights only the item matching urgentId', () => {
    const { host } = create({ items: [LINKED_ITEM, STUCK_ITEM], urgentId: 'tracks-stuck' })
    const listItems = Array.from(host.querySelectorAll('li'))
    const urgent = listItems.find((item) => item.textContent?.includes('Stuck'))
    const calm = listItems.find((item) => item.textContent?.includes('Open'))

    expect(urgent?.querySelector('.text-destructive')).not.toBeNull()
    expect(calm?.querySelector('.text-destructive')).toBeNull()
  })
})
