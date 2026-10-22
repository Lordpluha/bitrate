import { Component, provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it } from 'vitest'
import { CollectionStatus } from './collection-status'
import { provideTestTransloco } from '@testing/transloco'

@Component({
  imports: [CollectionStatus],
  template: `
    <app-collection-status
      [loading]="loading()"
      [failure]="failure()"
      [isEmpty]="isEmpty()"
      emptyMessage="Nothing to review in this filter."
      [retryLabel]="retryLabel()"
      (retry)="retries = retries + 1"
    />
  `,
})
class Host {
  readonly loading = signal(false)
  readonly failure = signal<string | null>(null)
  readonly isEmpty = signal(false)
  readonly retryLabel = signal<string | null>(null)
  retries = 0
}

describe('CollectionStatus', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [...provideTestTransloco(), provideZonelessChangeDetection()],
    })
  })

  async function render(change: (host: Host) => void) {
    const fixture = TestBed.createComponent(Host)
    change(fixture.componentInstance)
    await fixture.whenStable()
    return { root: fixture.nativeElement as HTMLElement, host: fixture.componentInstance }
  }

  it('announces loading while the first page is on its way', async () => {
    const { root } = await render((host) => host.loading.set(true))

    expect(root.querySelector('[role="status"]')?.textContent).toContain('Loading…')
  })

  it('shows the failure as an alert, even while a retry is loading', async () => {
    const { root } = await render((host) => {
      host.loading.set(true)
      host.failure.set('Reports could not be loaded.')
    })

    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Reports could not be loaded.',
    )
  })

  it('offers Try again only when the page wires a retry', async () => {
    const without = await render((host) => host.failure.set('Failed.'))
    expect(without.root.querySelector('button')).toBeNull()

    const withRetry = await render((host) => {
      host.failure.set('Failed.')
      host.retryLabel.set('Try again')
    })
    withRetry.root.querySelector('button')?.click()
    expect(withRetry.host.retries).toBe(1)
  })

  it('says the list is empty only once it has loaded without error', async () => {
    const { root } = await render((host) => host.isEmpty.set(true))

    expect(root.textContent).toContain('Nothing to review in this filter.')
  })

  it('renders nothing when there are rows', async () => {
    const { root } = await render(() => undefined)

    expect(root.textContent?.trim()).toBe('')
  })
})
