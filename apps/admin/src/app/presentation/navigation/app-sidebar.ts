import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucidePanelLeft } from '@ng-icons/lucide'
import { AppNavItem } from './nav-item'
import { NAV_SECTIONS } from './nav.model'
import { SIDEBAR_MAX, SIDEBAR_MIN, SidebarWidth } from './sidebar-width'

/**
 * The operator panel's rail: brand, sections, and a drag handle.
 *
 * Resizing is done with pointer events rather than a resizable-panel library because the rail
 * is one edge, not a split: a library would bring a whole layout model to move a single border,
 * and pointer capture already handles the part that is actually fiddly — keeping the drag alive
 * when the cursor outruns the handle.
 */
@Component({
  selector: 'app-sidebar',
  imports: [AppNavItem, NgIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucidePanelLeft })],
  /**
   * The host box is removed so the `<aside>` becomes the shell's flex item directly.
   *
   * Without this the host stretches to full height and the `<aside>` inside it does not — a
   * block child is `height: auto`, so the rail ended at the last menu item and took the footer
   * with it. It also means the `<aside>`'s own `shrink-0` finally applies: on a non-flex-item it
   * was doing nothing, and the rail could be squeezed by a wide page.
   *
   * Safe here because `<app-sidebar>` carries no role of its own; `display: contents` only
   * causes trouble on elements whose semantics would be dropped with the box.
   */
  host: { class: 'contents' },
  templateUrl: './app-sidebar.html',
})
export class AppSidebar {
  private readonly sidebar = inject(SidebarWidth)

  protected readonly sections = NAV_SECTIONS
  protected readonly width = this.sidebar.width
  protected readonly collapsed = this.sidebar.collapsed
  protected readonly min = SIDEBAR_MIN
  protected readonly max = SIDEBAR_MAX

  /** Drives the handle's own highlight; without it a drag looks like nothing is happening. */
  protected readonly dragging = signal(false)

  protected toggle(): void {
    this.sidebar.toggle()
  }

  protected reset(): void {
    this.sidebar.reset()
  }

  protected startResize(event: PointerEvent): void {
    event.preventDefault()
    const handle = event.target as HTMLElement
    handle.setPointerCapture(event.pointerId)
    this.dragging.set(true)
  }

  protected resize(event: PointerEvent): void {
    if (!this.dragging()) return

    this.sidebar.resizeTo(event.clientX)
  }

  protected endResize(event: PointerEvent): void {
    if (!this.dragging()) return

    const handle = event.target as HTMLElement
    handle.releasePointerCapture(event.pointerId)
    this.dragging.set(false)
  }

  /**
   * Keyboard resizing. A drag handle nobody can reach without a mouse is not a control, and
   * arrow keys on a `separator` role are what a screen reader user is told to expect.
   */
  protected nudge(event: KeyboardEvent): void {
    const step = event.shiftKey ? 48 : 16
    const current = this.width()

    if (event.key === 'ArrowLeft') this.sidebar.resizeTo(current - step)
    else if (event.key === 'ArrowRight') this.sidebar.resizeTo(current + step)
    else if (event.key === 'Enter' || event.key === ' ') this.sidebar.toggle()
    else return

    event.preventDefault()
  }
}
