import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { SessionStore } from '@application/session'
import { TranslocoPipe } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideAudioLines,
  lucideChevronRight,
  lucideClipboardCheck,
  lucideFlag,
  lucideLayoutDashboard,
  lucideScrollText,
  lucideSearch,
  lucideUsers,
} from '@ng-icons/lucide'
import { CommandPaletteLauncher, VisibleNav } from '@presentation/navigation'

/** Where people usually head after a dead link, in this order; only those the operator may open. */
const SHORTCUTS = ['/moderation', '/releases', '/catalog', '/users', '/audit'] as const
const SHORTCUT_COUNT = 4

/** The `notFound.shortcut.*` key describing each shortcut — what is there, never a live count. */
const SHORTCUT_HINT: Record<(typeof SHORTCUTS)[number], string> = {
  '/moderation': 'notFound.shortcut.moderation',
  '/releases': 'notFound.shortcut.releases',
  '/catalog': 'notFound.shortcut.catalog',
  '/users': 'notFound.shortcut.users',
  '/audit': 'notFound.shortcut.audit',
}

/**
 * Any address the console does not know, for a signed-in operator (the `**` route) — instead of
 * a silent redirect to `/`, which hid typos and stale links. It says what went wrong, shows the
 * address that was opened, and offers the ways back: Overview, the command palette, and the
 * sections the operator works in most.
 */
@Component({
  selector: 'app-not-found',
  imports: [NgIcon, RouterLink, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideAudioLines,
      lucideChevronRight,
      lucideClipboardCheck,
      lucideFlag,
      lucideLayoutDashboard,
      lucideScrollText,
      lucideSearch,
      lucideUsers,
    }),
  ],
  templateUrl: './not-found.html',
})
export class NotFoundPage {
  private readonly palette = inject(CommandPaletteLauncher)
  private readonly links = inject(VisibleNav).links

  protected readonly path = inject(Router).url
  protected readonly canOverview = inject(SessionStore).can('overview:read')

  protected readonly shortcuts = computed(() =>
    SHORTCUTS.map((path) => {
      const link = this.links().find((candidate) => candidate.path === path)
      return link ? { ...link, hint: SHORTCUT_HINT[path] } : null
    })
      .filter((link) => link !== null)
      .slice(0, SHORTCUT_COUNT),
  )

  protected openPalette(): void {
    this.palette.open()
  }
}
