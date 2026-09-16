import { Location } from '@angular/common'
import { provideLocationMocks } from '@angular/common/testing'
import { Component, effect, provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, Router, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryCodec, intParam, stringParam, type QueryCodec } from './query-codec'
import { bindQueryState } from './query-state'

type HostQuery = { q: string; page: number }

const codec: QueryCodec<HostQuery> = createQueryCodec({
  defaults: { q: '', page: 1 },
  fields: {
    q: { param: 'q', codec: stringParam() },
    page: { param: 'page', codec: intParam(1) },
  },
})

@Component({ selector: 'app-query-host', template: '' })
class QueryHostComponent {
  readonly runs = signal(0)
  readonly query = bindQueryState({ codec })

  constructor() {
    effect(() => {
      this.query.state()
      this.runs.update((n) => n + 1)
    })
  }
}

const routes: Routes = [{ path: 'host', component: QueryHostComponent }]

describe('bindQueryState', () => {
  let harness: RouterTestingHarness

  beforeEach(async () => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter(routes), provideLocationMocks()],
    })
    harness = await RouterTestingHarness.create()
  })

  it('decodes the query string a navigation lands on, notifying exactly once', async () => {
    const host = await harness.navigateByUrl('/host?q=angular&page=2', QueryHostComponent)
    await harness.fixture.whenStable()

    expect(host.query.state()).toEqual({ q: 'angular', page: 2 })
    /**
     * `queryParamMap` emits synchronously on subscribe with the same value as the snapshot the
     * signal was seeded from. The serialised `equal` must swallow that, or every screen loads
     * twice on first render.
     */
    expect(host.runs()).toBe(1)
  })

  it('re-notifies once for a navigation that changes the canonical query, and not again for an identical one', async () => {
    const host = await harness.navigateByUrl('/host?q=a&page=2', QueryHostComponent)
    await harness.fixture.whenStable()
    const runsAfterFirst = host.runs()

    await harness.navigateByUrl('/host?q=a&page=2')
    await harness.fixture.whenStable()
    expect(host.runs()).toBe(runsAfterFirst)

    await harness.navigateByUrl('/host?q=b&page=2')
    await harness.fixture.whenStable()
    expect(host.runs()).toBe(runsAfterFirst + 1)
    expect(host.query.state()).toEqual({ q: 'b', page: 2 })
  })

  /**
   * Not a back-button test, deliberately. `RouterTestingHarness` drives the Router without
   * pushing real history entries, so `Location.back()` has nothing to replay. How the browser
   * reaches a prior URL is Angular's contract; what this factory owns is decoding whatever that
   * URL is. The history semantics that *are* ours live in the `replaceUrl` case below.
   */
  it('returns to the earlier state when a prior URL is navigated to again', async () => {
    const host = await harness.navigateByUrl('/host?q=a&page=1', QueryHostComponent)
    await harness.fixture.whenStable()

    await harness.navigateByUrl('/host?q=b&page=1')
    await harness.fixture.whenStable()
    expect(host.query.state()).toEqual({ q: 'b', page: 1 })

    await harness.navigateByUrl('/host?q=a&page=1')
    await harness.fixture.whenStable()

    expect(host.query.state()).toEqual({ q: 'a', page: 1 })
  })

  /**
   * This is what makes back/forward sensible: one history entry per deliberate action, none per
   * keystroke. Asserted on the navigation call itself, so no history emulation is involved.
   */
  it('adds a history entry for a discrete change and replaces it for a text filter', async () => {
    const host = await harness.navigateByUrl('/host', QueryHostComponent)
    await harness.fixture.whenStable()
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate')

    host.query.patch({ page: 2 })
    expect(navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ replaceUrl: false }),
    )

    host.query.patch({ q: 'ang' }, { replaceUrl: true })
    expect(navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ replaceUrl: true }),
    )
  })

  it('patch navigates to a canonical, default-omitting query string', async () => {
    const host = await harness.navigateByUrl('/host', QueryHostComponent)
    await harness.fixture.whenStable()

    host.query.patch({ q: 'angular', page: 3 })
    await harness.fixture.whenStable()

    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/host?q=angular&page=3')

    host.query.patch({ q: '', page: 1 })
    await harness.fixture.whenStable()

    expect(location.path()).toBe('/host')
  })
})
