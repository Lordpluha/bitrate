import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SidebarState } from './sidebar-state'

const STORAGE_KEY = 'bitrate.admin.sidebar'

function create(): SidebarState {
  TestBed.resetTestingModule()
  return TestBed.inject(SidebarState)
}

describe('SidebarState', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('starts expanded', () => {
    expect(create().collapsed()).toBe(false)
  })

  it('folds to the rail and back, remembering the choice', () => {
    const sidebar = create()
    sidebar.toggle()

    expect(sidebar.collapsed()).toBe(true)
    expect(create().collapsed()).toBe(true)

    create().toggle()
    expect(create().collapsed()).toBe(false)
  })

  describe('persistence', () => {
    /** The drag-resizable sidebar stored `{ width, collapsed }` under the same key. */
    it('keeps a collapsed choice stored by the old resizable sidebar', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ width: 300, collapsed: true }))

      expect(create().collapsed()).toBe(true)
    })

    it('falls back to expanded on unparseable storage', () => {
      localStorage.setItem(STORAGE_KEY, 'not json')

      expect(create().collapsed()).toBe(false)
    })

    /** A private window throws on access rather than returning null; a layout preference is
     *  never worth failing the page over. */
    it('survives storage that throws on read', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied')
      })

      expect(create().collapsed()).toBe(false)
    })

    it('survives storage that throws on write', () => {
      const sidebar = create()
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota')
      })

      expect(() => sidebar.toggle()).not.toThrow()
      expect(sidebar.collapsed()).toBe(true)
    })
  })
})
