import { Component, provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { provideIcons } from '@ng-icons/core'
import { lucideFlag, lucideMusic } from '@ng-icons/lucide'
import { beforeEach, describe, expect, it } from 'vitest'
import { FilterMenu, type FilterOption } from './filter-menu'
import { MetricTile } from './metric-tile'
import { PageHeader, type PageBack } from './page-header'
import { SearchField } from './search-field'
import { type StateMessageKind, StateMessage } from './state-message'
import { Tile } from './tile'

type Status = 'OPEN' | 'RESOLVED' | null

@Component({
  imports: [FilterMenu, MetricTile, PageHeader, SearchField, StateMessage, Tile],
  providers: [provideIcons({ lucideFlag, lucideMusic })],
  template: `
    <app-metric-tile icon="lucideFlag" label="Open" [value]="value()" [loading]="loading()" />
    <app-state-message
      [kind]="kind()"
      title="Reports didn’t load"
      [actionLabel]="actionLabel()"
      (action)="actions = actions + 1"
    />
    <app-filter-menu
      label="Status"
      [options]="options"
      [value]="status()"
      [defaultValue]="null"
      (valueChange)="chosen.push($event)"
    />
    <app-page-header title="Night Drive" [back]="back()" />
    <app-tile icon="lucideMusic" title="Reported track" meta="Kavinsky" />
    <app-search-field label="Search reports" (valueChange)="terms.push($event)" />
  `,
})
class Host {
  readonly value = signal<number | string | null>(1204)
  readonly loading = signal(false)
  readonly kind = signal<StateMessageKind>('error')
  readonly actionLabel = signal<string | null>('Try again')
  readonly status = signal<Status>(null)
  readonly back = signal<PageBack | null>(null)
  readonly options: readonly FilterOption<Status>[] = [
    { value: null, label: 'All' },
    { value: 'OPEN', label: 'Open' },
    { value: 'RESOLVED', label: 'Resolved' },
  ]
  actions = 0
  readonly chosen: Status[] = []
  readonly terms: string[] = []
}

describe('glass surface blocks', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    })
  })

  async function render() {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const root = fixture.nativeElement as HTMLElement
    const update = async (change: (host: Host) => void) => {
      change(fixture.componentInstance)
      await fixture.whenStable()
    }
    return { fixture, root, host: fixture.componentInstance, update }
  }

  describe('MetricTile', () => {
    it('formats a count', async () => {
      const { root } = await render()

      expect(root.querySelector('app-metric-tile')?.textContent).toContain((1204).toLocaleString())
    })

    it('shows a dash, never a zero, when there is no figure', async () => {
      const { root, update } = await render()
      await update((host) => host.value.set(null))

      expect(root.querySelector('app-metric-tile')?.textContent).toContain('—')
      expect(root.querySelector('app-metric-tile')?.textContent).not.toContain('0')
    })

    it('hides the label and value while loading', async () => {
      const { root, update } = await render()
      await update((host) => host.loading.set(true))

      expect(root.querySelector('app-metric-tile')?.textContent).not.toContain('Open')
    })
  })

  describe('StateMessage', () => {
    it('announces a failure as an alert and offers the recovery action', async () => {
      const { root, host } = await render()
      const message = root.querySelector('app-state-message') as HTMLElement
      message.querySelector('button')?.click()

      expect(message.getAttribute('role')).toBe('alert')
      expect(message.textContent).toContain('Reports didn’t load')
      expect(host.actions).toBe(1)
    })

    it('announces an empty queue politely, with no button when none is given', async () => {
      const { root, update } = await render()
      await update((host) => {
        host.kind.set('empty')
        host.actionLabel.set(null)
      })
      const message = root.querySelector('app-state-message') as HTMLElement

      expect(message.getAttribute('role')).toBe('status')
      expect(message.querySelector('button')).toBeNull()
    })
  })

  describe('FilterMenu', () => {
    const trigger = (root: HTMLElement) =>
      root.querySelector('app-filter-menu button') as HTMLButtonElement

    it('names the filter and its current value', async () => {
      const { root } = await render()

      expect(trigger(root).textContent?.replace(/\s+/g, ' ').trim()).toBe('Status: All')
    })

    it('lights up only while the list is narrowed', async () => {
      const { root, update } = await render()
      expect(trigger(root).classList).not.toContain('bg-primary-soft')

      await update((host) => host.status.set('OPEN'))
      expect(trigger(root).classList).toContain('bg-primary-soft')
    })

    it('reports a new choice and ignores the current one', async () => {
      const { root, host, fixture } = await render()
      const open = async () => {
        trigger(root).click()
        await fixture.whenStable()
        return Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'))
      }

      ;(await open()).find((item) => item.textContent?.includes('All'))?.click()
      await fixture.whenStable()
      ;(await open()).find((item) => item.textContent?.includes('Resolved'))?.click()

      expect(host.chosen).toEqual(['RESOLVED'])
    })

    it('marks the current value as checked for assistive tech', async () => {
      const { root, fixture } = await render()
      trigger(root).click()
      await fixture.whenStable()
      const checked = document.querySelector('[role="menuitemradio"][aria-checked="true"]')

      expect(checked?.textContent).toContain('All')
    })
  })

  describe('PageHeader', () => {
    it('renders the one heading of the screen', async () => {
      const { root } = await render()

      expect(root.querySelectorAll('h1')).toHaveLength(1)
      expect(root.querySelector('h1')?.textContent).toContain('Night Drive')
    })

    it('links back to the list only on a record page', async () => {
      const { root, update } = await render()
      expect(root.querySelector('app-page-header a')).toBeNull()

      await update((host) => host.back.set({ link: '/moderation', label: 'Moderation' }))
      const link = root.querySelector('app-page-header a')
      expect(link?.getAttribute('href')).toBe('/moderation')
      expect(link?.textContent).toContain('Moderation')
    })
  })

  describe('Tile', () => {
    it('is a region named by its title', async () => {
      const { root } = await render()
      const tile = root.querySelector('app-tile') as HTMLElement
      const titleId = tile.getAttribute('aria-labelledby')

      expect(tile.getAttribute('role')).toBe('region')
      expect(titleId && root.querySelector(`#${titleId}`)?.textContent).toBe('Reported track')
    })
  })

  describe('SearchField', () => {
    it('reports every edit and is named by its label', async () => {
      const { root, host } = await render()
      const input = root.querySelector('app-search-field input') as HTMLInputElement
      input.value = 'night'
      input.dispatchEvent(new Event('input'))

      expect(input.getAttribute('aria-label')).toBe('Search reports')
      expect(host.terms).toEqual(['night'])
    })
  })
})
