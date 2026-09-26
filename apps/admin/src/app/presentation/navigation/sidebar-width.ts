import { computed, Injectable, signal } from '@angular/core'

const STORAGE_KEY = 'bitrate.admin.sidebar'

/** Below this the labels stop fitting, so the rail collapses to icons instead of truncating. */
export const SIDEBAR_MIN = 200
export const SIDEBAR_MAX = 420
export const SIDEBAR_DEFAULT = 248
/** Icon-only rail: one 20px icon plus even padding, sized to stay a 44px touch target. */
export const SIDEBAR_COLLAPSED = 64
/** Dragging narrower than this snaps shut rather than leaving an unusable sliver. */
/** Not exported: only `resizeTo` below acts on it. */
const SIDEBAR_SNAP_THRESHOLD = 168

type PersistedState = {
  width: number
  collapsed: boolean
}

/**
 * Sidebar width, remembered per browser.
 *
 * `localStorage` is wrapped in try/catch on both sides: a private window, cleared site data or a
 * browser set to block storage all throw on access rather than returning null, and a layout
 * preference is never worth failing a page load over.
 */
@Injectable({ providedIn: 'root' })
export class SidebarWidth {
  private readonly state = signal<PersistedState>(read())

  readonly collapsed = computed(() => this.state().collapsed)
  /** What the rail should actually be, in px — the only value the template needs. */
  readonly width = computed(() => (this.state().collapsed ? SIDEBAR_COLLAPSED : this.state().width))

  /** Called continuously while dragging; clamps and snaps rather than trusting the pointer. */
  resizeTo(width: number): void {
    if (width < SIDEBAR_SNAP_THRESHOLD) {
      this.write({ width: this.state().width, collapsed: true })
      return
    }

    this.write({
      width: Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, Math.round(width))),
      collapsed: false,
    })
  }

  toggle(): void {
    this.write({ ...this.state(), collapsed: !this.state().collapsed })
  }

  /** Double-clicking the handle is the conventional "put it back" gesture. */
  reset(): void {
    this.write({ width: SIDEBAR_DEFAULT, collapsed: false })
  }

  private write(next: PersistedState): void {
    this.state.set(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* A remembered width is a convenience; losing it is not an error worth surfacing. */
    }
  }
}

function read(): PersistedState {
  const fallback: PersistedState = { width: SIDEBAR_DEFAULT, collapsed: false }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback

    const parsed = JSON.parse(raw) as Partial<PersistedState>
    const width = typeof parsed.width === 'number' ? parsed.width : SIDEBAR_DEFAULT

    return {
      width: Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, width)),
      collapsed: parsed.collapsed === true,
    }
  } catch {
    return fallback
  }
}
