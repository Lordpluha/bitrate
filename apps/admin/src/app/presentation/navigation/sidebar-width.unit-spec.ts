import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SIDEBAR_COLLAPSED,
  SIDEBAR_DEFAULT,
  SIDEBAR_MAX,
  SIDEBAR_MIN,
  SidebarWidth,
} from './sidebar-width'

const STORAGE_KEY = 'bitrate.admin.sidebar'

function create(): SidebarWidth {
  TestBed.resetTestingModule()
  return TestBed.inject(SidebarWidth)
}

describe('SidebarWidth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('starts at the default width, expanded', () => {
    const sidebar = create()

    expect(sidebar.width()).toBe(SIDEBAR_DEFAULT)
    expect(sidebar.collapsed()).toBe(false)
  })

  describe('resizing', () => {
    it('clamps above the maximum instead of letting the rail eat the page', () => {
      const sidebar = create()
      sidebar.resizeTo(SIDEBAR_MAX + 500)

      expect(sidebar.width()).toBe(SIDEBAR_MAX)
    })

    it('clamps at the minimum for a width that is small but not small enough to snap', () => {
      const sidebar = create()
      sidebar.resizeTo(SIDEBAR_MIN - 10)

      expect(sidebar.width()).toBe(SIDEBAR_MIN)
      expect(sidebar.collapsed()).toBe(false)
    })

    it('snaps shut below the threshold rather than leaving an unusable sliver', () => {
      const sidebar = create()
      sidebar.resizeTo(40)

      expect(sidebar.collapsed()).toBe(true)
      expect(sidebar.width()).toBe(SIDEBAR_COLLAPSED)
    })

    /** Collapsing must not forget where the rail was, or expanding lands somewhere arbitrary. */
    it('remembers the expanded width across a snap and a re-open', () => {
      const sidebar = create()
      sidebar.resizeTo(320)
      sidebar.resizeTo(20)
      expect(sidebar.collapsed()).toBe(true)

      sidebar.toggle()

      expect(sidebar.width()).toBe(320)
    })

    it('rounds a fractional pointer position', () => {
      const sidebar = create()
      sidebar.resizeTo(287.6)

      expect(sidebar.width()).toBe(288)
    })
  })

  it('reset puts it back to the default and opens it', () => {
    const sidebar = create()
    sidebar.resizeTo(20)
    sidebar.reset()

    expect(sidebar.width()).toBe(SIDEBAR_DEFAULT)
    expect(sidebar.collapsed()).toBe(false)
  })

  describe('persistence', () => {
    it('restores a stored width', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ width: 300, collapsed: false }))

      expect(create().width()).toBe(300)
    })

    it('clamps a stored width that is out of range', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ width: 9000, collapsed: false }))

      expect(create().width()).toBe(SIDEBAR_MAX)
    })

    it('falls back to the default on unparseable storage', () => {
      localStorage.setItem(STORAGE_KEY, 'not json')

      expect(create().width()).toBe(SIDEBAR_DEFAULT)
    })

    /** A private window throws on access rather than returning null; a layout preference is
     *  never worth failing the page over. */
    it('survives storage that throws on read', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied')
      })

      expect(create().width()).toBe(SIDEBAR_DEFAULT)
    })

    it('survives storage that throws on write', () => {
      const sidebar = create()
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota')
      })

      expect(() => sidebar.resizeTo(300)).not.toThrow()
      expect(sidebar.width()).toBe(300)
    })
  })
})
