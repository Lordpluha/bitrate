import { computed, Injectable, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { type ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router'
import { filter, map } from 'rxjs'
import type { NavLink } from './nav.model'
import { NAV_SECTIONS } from './nav.model'

/** Route data key a screen outside the navigation (the 404) sets to name itself in the island. */
export const CRUMB_DATA_KEY = 'crumb'

const ALL_LINKS: readonly NavLink[] = NAV_SECTIONS.flatMap((section) =>
  section.items.flatMap((item) => (item.kind === 'link' ? [item] : item.children)),
)

/**
 * The section a URL belongs to: the longest navigation path that is the URL itself or one of its
 * ancestors (`/moderation/R-1` → Moderation). `/` matches only itself, or every page would be
 * "Overview".
 */
export function sectionFor(url: string): NavLink | undefined {
  const path = url.split(/[?#]/)[0] ?? '/'
  return ALL_LINKS.filter((link) =>
    link.path === '/' ? path === '/' : path === link.path || path.startsWith(`${link.path}/`),
  ).sort((a, b) => b.path.length - a.path.length)[0]
}

function deepest(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  return route.firstChild ? deepest(route.firstChild) : route
}

/**
 * The transloco key of where the operator is, for the status island in the top bar: a route's own
 * `crumb` (the 404 says "Not found") or else its navigation section. `null` before the first
 * navigation settles and on screens that belong to no section.
 */
@Injectable({ providedIn: 'root' })
export class CurrentCrumb {
  private readonly router = inject(Router)

  private readonly settled = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => ({
        url: this.router.url,
        crumb: deepest(this.router.routerState.snapshot.root).data[CRUMB_DATA_KEY] as unknown,
      })),
    ),
    { initialValue: null },
  )

  readonly key = computed<string | null>(() => {
    const state = this.settled()
    if (!state) return null
    if (typeof state.crumb === 'string') return state.crumb
    return sectionFor(state.url)?.label ?? null
  })
}
