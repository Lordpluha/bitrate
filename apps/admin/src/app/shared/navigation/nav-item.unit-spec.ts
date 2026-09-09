import { provideZonelessChangeDetection } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppNavItem } from './nav-item'
import type { NavGroup, NavItem, NavLink } from './nav.model'

const link: NavLink = {
  kind: 'link',
  path: '/moderation',
  label: 'Moderation queue',
  icon: 'lucideFlag',
}

const group: NavGroup = {
  kind: 'group',
  id: 'catalog',
  label: 'Catalog',
  icon: 'lucideAudioLines',
  children: [
    { kind: 'link', path: '/catalog', label: 'Pipeline', icon: 'lucideAudioLines' },
    { kind: 'link', path: '/catalog/tracks', label: 'Tracks', icon: 'lucideAudioLines' },
  ],
}

async function render(item: NavItem, collapsed = false): Promise<ComponentFixture<AppNavItem>> {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), provideRouter([])],
  })

  const fixture = TestBed.createComponent(AppNavItem)
  fixture.componentRef.setInput('item', item)
  fixture.componentRef.setInput('collapsed', collapsed)
  await fixture.whenStable()

  return fixture
}

function html(fixture: ComponentFixture<AppNavItem>): HTMLElement {
  return fixture.nativeElement as HTMLElement
}

describe('AppNavItem', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
  })

  describe('a link', () => {
    it('renders one anchor to its path', async () => {
      const el = html(await render(link))
      const anchor = el.querySelector('a')

      expect(anchor?.getAttribute('href')).toBe('/moderation')
      expect(anchor?.textContent).toContain('Moderation queue')
    })

    /** Collapsed, the label has to stay reachable by assistive tech even though it is hidden. */
    it('keeps the label available to screen readers when collapsed', async () => {
      const el = html(await render(link, true))

      expect(el.querySelector('.sr-only')?.textContent).toContain('Moderation queue')
      expect(el.querySelector('a')?.getAttribute('title')).toBe('Moderation queue')
    })
  })

  describe('a group', () => {
    it('renders a trigger and its children, open by default', async () => {
      const el = html(await render(group))

      expect(el.querySelector('button')?.textContent).toContain('Catalog')
      expect(el.querySelectorAll('ul a')).toHaveLength(2)
    })

    it('marks the trigger as expanded and points it at the child list', async () => {
      const el = html(await render(group))
      const trigger = el.querySelector('button')

      expect(trigger?.getAttribute('aria-expanded')).toBe('true')
      expect(trigger?.getAttribute('aria-controls')).toBe('catalog-children')
      expect(el.querySelector('ul')?.id).toBe('catalog-children')
    })

    it('hides the children when the trigger is toggled', async () => {
      const fixture = await render(group)
      const trigger = html(fixture).querySelector('button')

      trigger?.click()
      await fixture.whenStable()

      expect(html(fixture).querySelectorAll('ul a')).toHaveLength(0)
      expect(html(fixture).querySelector('button')?.getAttribute('aria-expanded')).toBe('false')
    })

    /**
     * Children are hidden rather than squeezed into the icon rail: there is no icon column to
     * put them in, and a nameless indent in a 64px rail communicates nothing.
     */
    it('does not render children while collapsed, even when open', async () => {
      const el = html(await render(group, true))

      expect(el.querySelector('button')).not.toBeNull()
      expect(el.querySelectorAll('ul a')).toHaveLength(0)
    })
  })
})
