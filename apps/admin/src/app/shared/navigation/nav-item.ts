import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideAudioLines,
  lucideChevronRight,
  lucideFlag,
  lucideMic,
  lucideScrollText,
  lucideUsers,
} from '@ng-icons/lucide'
import type { NavItem } from './nav.model'

/**
 * One navigation row, rendering whichever of the two shapes it was given.
 *
 * A link and a group's trigger deliberately share a silhouette — same height, same icon slot,
 * same hover — so the sidebar reads as one list rather than two. What separates them is the
 * chevron and what happens on click. The children below a group then break that silhouette on
 * purpose: no icon, an indent, and a vertical guide, so they read as *inside* the group instead
 * of as more siblings.
 */
@Component({
  selector: 'app-nav-item',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideAudioLines,
      lucideChevronRight,
      lucideFlag,
      lucideMic,
      lucideScrollText,
      lucideUsers,
    }),
  ],
  templateUrl: './nav-item.html',
})
export class AppNavItem {
  readonly item = input.required<NavItem>()
  readonly collapsed = input(false)

  /** Groups start open: hiding a destination behind a click is a cost, not a tidy-up. */
  protected readonly open = signal(true)

  protected readonly isGroup = computed(() => this.item().kind === 'group')

  protected toggle(): void {
    this.open.update((value) => !value)
  }
}
