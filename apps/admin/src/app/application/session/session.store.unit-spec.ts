import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import type { Staff } from '@domain/staff'
import { beforeEach, describe, expect, it } from 'vitest'
import { SessionStore } from './session.store'

const MODERATOR: Staff = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'MODERATOR',
  permissions: ['reports:read'],
}

describe('SessionStore.can', () => {
  let store: SessionStore

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] })
    store = TestBed.inject(SessionStore)
  })

  it('is false when nobody is signed in', () => {
    expect(store.can('reports:read')()).toBe(false)
  })

  it('is true for a permission the signed-in operator holds', () => {
    store.set(MODERATOR)

    expect(store.can('reports:read')()).toBe(true)
  })

  it('is false for a permission the signed-in operator lacks', () => {
    store.set(MODERATOR)

    expect(store.can('staff:write')()).toBe(false)
  })

  it('is true for the ADMIN super-admin regardless of its own permission list', () => {
    store.set({ ...MODERATOR, roleName: 'ADMIN', permissions: [] })

    expect(store.can('staff:write')()).toBe(true)
  })
})
