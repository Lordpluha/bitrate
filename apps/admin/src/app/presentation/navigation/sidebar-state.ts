import { Injectable, signal } from '@angular/core'

const STORAGE_KEY = 'bitrate.admin.sidebar'

/** The floating panel with labels, and the icon rail it folds into. */
export const SIDEBAR_EXPANDED = 248
export const SIDEBAR_RAIL = 76

/**
 * Whether the floating sidebar is folded to its icon rail, remembered per browser.
 *
 * The key is the one the old drag-resizable sidebar used; its stored `{ width, collapsed }`
 * still reads correctly — only `collapsed` survives the redesign, so nobody's choice is lost.
 *
 * `localStorage` is wrapped in try/catch on both sides: a private window, cleared site data or a
 * browser set to block storage all throw on access rather than returning null, and a layout
 * preference is never worth failing a page load over.
 */
@Injectable({ providedIn: 'root' })
export class SidebarState {
  private readonly state = signal(read())

  readonly collapsed = this.state.asReadonly()

  toggle(): void {
    this.state.update((value) => !value)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ collapsed: this.state() }))
    } catch {
      /* A remembered layout is a convenience; losing it is not an error worth surfacing. */
    }
  }
}

function read(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false

    const parsed = JSON.parse(raw) as { collapsed?: unknown }
    return parsed.collapsed === true
  } catch {
    return false
  }
}
